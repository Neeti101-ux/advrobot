import { GoogleGenAI, GenerateContentResponse, GroundingChunk, Chat } from "@google/genai";
import { 
    GEMINI_MODEL_LEGAL_ASSISTANT, 
    DEFAULT_ERROR_MESSAGE,
    getSystemPromptForJurisdiction
} from '../constants';
import { Jurisdiction, Message as AppMessage, FileAttachment } from "../types";

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
  fileAttachment?: FileAttachment,
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
  const latestMessage = currentMessages[currentMessages.length - 1];
  
  if (!latestMessage) {
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

    // Prepare the message parts for the latest user message
    const messageParts: any[] = [];
    
    // Add text content if present
    if (latestMessage.text && latestMessage.text.trim()) {
      messageParts.push({ text: latestMessage.text });
    }
    
    // Add file content if present
    if (fileAttachment) {
      if (fileAttachment.type.startsWith('image/')) {
        // For images, send as inline data
        const base64Data = fileAttachment.content.split(',')[1]; // Remove data:image/...;base64, prefix
        
        // Check if base64Data is not empty before creating inlineData part
        if (base64Data && base64Data.trim()) {
          messageParts.push({
            inlineData: {
              mimeType: fileAttachment.type,
              data: base64Data
            }
          });
        } else {
          // If base64 data is empty, add a descriptive text part instead
          messageParts.push({
            text: `[Empty image file: ${fileAttachment.name}]`
          });
        }
      } else {
        // For text-based files, include content as text with context
        messageParts.push({
          text: `File: ${fileAttachment.name} (${fileAttachment.type})\n\nContent:\n${fileAttachment.content}`
        });
      }
    }

    // If no text and no file, add a default message
    if (messageParts.length === 0) {
      messageParts.push({ text: "Please analyze the uploaded content." });
    }

    const stream = await legalChat.sendMessageStream({ parts: messageParts });
    let accumulatedSources: GroundingChunk[] = [];

    for await (const chunk of stream) { // chunk is GenerateContentResponse
      const chunkText = chunk.text; // Access text directly from chunk
      const chunkSources = enableWebSearch ? (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || []) : [];
      
      if (chunkSources.length > 0) {
        // Simple deduplication based on URI and Title for accumulated sources
        chunkSources.forEach(newSource => {
            if (!accumulatedSources.some(existingSource => 
                existingSource.web?.uri === newSource.web?.uri && 
                existingSource.web?.title === newSource.web?.title
            )) {
                accumulatedSources.push(newSource);
            }
        });
      }
      onChunk(chunkText, accumulatedSources.length > 0 ? [...accumulatedSources] : undefined); // Pass a copy
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