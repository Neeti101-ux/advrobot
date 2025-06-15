
import { GoogleGenAI, GenerateContentResponse, GroundingChunk, Chat } from "@google/genai";
import { 
    GEMINI_MODEL_LEGAL_ASSISTANT, 
    DEFAULT_ERROR_MESSAGE,
    getSystemPromptForJurisdiction
} from '../constants';
import { Jurisdiction, Message as AppMessage } from "../types";

// Initialize the AI client for app-specific tasks (e.g., legal assistant)
// Assumes process.env.API_KEY is available in the execution environment
let appAiInstance: GoogleGenAI | null = null;
const appApiKey = process.env.API_KEY;

if (!appApiKey) {
    console.warn("API_KEY environment variable not found. App-specific AI functionalities (like Cyber Law Assistant) will be disabled.");
} else {
    try {
        appAiInstance = new GoogleGenAI({ apiKey: appApiKey });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI for app:", error);
        appAiInstance = null; 
    }
}

// User-specific AI instance and jailbreak testing functions are removed as per new architecture.

// Store for legal chat instances
let legalChat: Chat | null = null;

export const streamLegalAdvice = async (
  jurisdiction: Jurisdiction,
  currentMessages: AppMessage[], // Full chat history including the latest user message
  enableWebSearch: boolean,
  onChunk: (chunkText: string, sources?: GroundingChunk[]) => void,
  onError: (errorMsg: string) => void,
  onDone: () => void
) => {
  if (!appAiInstance) {
    onError("Cyber Law AI service not available. API key might be missing or invalid.");
    onDone();
    return;
  }

  const systemInstruction = getSystemPromptForJurisdiction(jurisdiction, enableWebSearch);
  const userQuery = currentMessages[currentMessages.length - 1]?.text;

  if (!userQuery) {
    onError("No query provided.");
    onDone();
    return;
  }
  
  const historyForGemini = currentMessages.slice(0, -1)
    .filter(msg => msg.sender === 'user' || msg.sender === 'bot') 
    .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        // Ensure parts is an array, and text is properly formatted.
        // The service expects `Part[]`. A simple text message is `[{text: msg.text}]`.
        parts: [{text: msg.text}] 
    }));

  try {
    const chatConfig: {
        systemInstruction: string;
        tools?: any[]; 
    } = {
        systemInstruction: systemInstruction,
    };

    if (enableWebSearch) {
        chatConfig.tools = [{googleSearch: {}}];
    }
    
    legalChat = appAiInstance.chats.create({
        model: GEMINI_MODEL_LEGAL_ASSISTANT,
        config: chatConfig,
        history: historyForGemini 
    });

    const stream = await legalChat.sendMessageStream({ message: userQuery }); // sendMessageStream expects {message: string} which becomes {role:'user', parts:[{text:userQuery}]}
    let accumulatedSources: GroundingChunk[] = [];

    for await (const chunk of stream) { // chunk is GenerateContentResponse
      const chunkText = chunk.text; // Access text directly from chunk
      const chunkSources = enableWebSearch ? (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || []) : [];
      
      if (chunkSources.length > 0) {
        // Accumulate all sources with deduplication based on URI
        chunkSources.forEach(newSource => {
            if (newSource.web && !accumulatedSources.some(existingSource => 
                existingSource.web?.uri === newSource.web?.uri
            )) {
                accumulatedSources.push(newSource);
            }
        });
      }
      
      // Always pass the accumulated sources if we have any
      onChunk(chunkText, accumulatedSources.length > 0 ? accumulatedSources : undefined);
    }
  } catch (error: any) {
    console.error(`Error getting legal advice for ${jurisdiction}:`, error);
    let errorMessage = DEFAULT_ERROR_MESSAGE;
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else if (error && typeof error.message === 'string') {
        errorMessage = error.message;
    }
    onError(errorMessage);
  } finally {
    onDone();
  }
};
