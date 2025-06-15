import React, { useState, useCallback, useEffect } from 'react';
import { Jurisdiction, Message } from '../../types';
import { JURISDICTIONS_LIST, LEXMACHINA_BOT_NAME, LEXMACHINA_TYPING_MESSAGE, DEFAULT_ERROR_MESSAGE } from '../../constants';
import { JurisdictionSelector } from './components/JurisdictionSelector';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { streamLegalAdvice } from '../../services/geminiService';
import { CyberLawChatWindow } from './components/CyberLawChatWindow'; // New component
import { GroundingChunk } from '@google/genai';

export const CyberLawAssistantDashboard: React.FC = () => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>(Jurisdiction.India);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState<boolean>(true); // Default to enabled
  
  const currentJurisdictionName = JURISDICTIONS_LIST.find(j => j.id === selectedJurisdiction)?.name || selectedJurisdiction;

  const handleToggleWebSearch = () => {
    setIsWebSearchEnabled(prev => !prev);
    const status = !isWebSearchEnabled ? "ENABLED" : "DISABLED";
    const systemMessage: Message = {
        id: 'system-websearch-toggle-' + Date.now(),
        text: `Web search feature has been ${status}.`,
        sender: 'system',
        timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  useEffect(() => {
    setMessages([
      {
        id: 'system-intro-' + Date.now(),
        text: `${LEXMACHINA_BOT_NAME} activated for ${currentJurisdictionName}. Web search is currently ${isWebSearchEnabled ? "ENABLED" : "DISABLED"}. How can I assist with your cyber law query?`,
        sender: 'system',
        timestamp: new Date().toISOString(),
      }
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJurisdiction, currentJurisdictionName]); 

  useEffect(() => {
    if (messages.length > 1 && messages.some(m => m.id.startsWith('system-intro'))) { 
        // This logic is to update the welcome message if web search is toggled *before* any other interaction
        // If messages only contains the intro message, update it.
        if (messages.length === 1 && messages[0].id.startsWith('system-intro')) {
             setMessages(prev => prev.map(m => 
                m.id.startsWith('system-intro') 
                ? { ...m, text: `${LEXMACHINA_BOT_NAME} activated for ${currentJurisdictionName}. Web search is currently ${isWebSearchEnabled ? "ENABLED" : "DISABLED"}. How can I assist with your cyber law query?`}
                : m
            ));
        }
        // If more messages exist, a separate system message about toggle is already handled by handleToggleWebSearch
    }
  }, [isWebSearchEnabled, currentJurisdictionName, messages]);


  const handleSendMessage = useCallback(async (userInput: string) => {
    setError(null);
    const newUserMessage: Message = {
      id: 'user-' + Date.now(),
      text: userInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const botMessageId = 'bot-' + Date.now();
    setMessages(prev => [...prev, { 
        id: botMessageId, 
        text: "", 
        sender: 'bot', 
        timestamp: new Date().toISOString(),
        sources: [] 
    }]);

    let fullBotResponse = "";
    let finalSources: GroundingChunk[] = [];

    await streamLegalAdvice(
      selectedJurisdiction,
      updatedMessages,
      isWebSearchEnabled, 
      (chunkText, chunkSources) => {
        fullBotResponse += chunkText;
        if (chunkSources) {
            finalSources = chunkSources; 
        }
        setMessages(prev => prev.map(m => 
            m.id === botMessageId ? { ...m, text: fullBotResponse, sources: finalSources } : m
        ));
      },
      (errorMsg) => {
        setError(errorMsg);
        setMessages(prev => prev.map(m => 
            m.id === botMessageId ? { ...m, text: `Error: ${errorMsg}`, glitch: false } : m
        ));
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        if (!fullBotResponse && !error) {
             setMessages(prev => prev.map(m => 
                m.id === botMessageId ? { ...m, text: "I could not generate a response for this query. Please try rephrasing or try another query.", glitch: false } : m
            ));
        }
      }
    );
  }, [selectedJurisdiction, messages, isWebSearchEnabled, error]); 

  const handleJurisdictionChange = (newJurisdiction: Jurisdiction) => {
    setSelectedJurisdiction(newJurisdiction);
    setError(null); 
    setIsLoading(false); 
  };

  return (
    <div className="p-1 sm:p-2 h-full flex flex-col bg-hacker-dark">
      <header className="p-2 sm:p-3 bg-hacker-border shadow-md flex flex-col sm:flex-row sm:justify-between items-center gap-2">
        <h1 className="text-lg sm:text-xl md:text-2xl font-share-tech-mono text-hacker-green text-center sm:text-left">
          CYBER LAW AI
        </h1>
        <div className="w-full sm:w-auto max-w-[240px] sm:max-w-xs">
            <JurisdictionSelector 
            selectedJurisdiction={selectedJurisdiction} 
            onJurisdictionChange={handleJurisdictionChange} 
            />
        </div>
      </header>
      
      {error && <p className="text-hacker-accent p-1.5 sm:p-2 bg-red-900 bg-opacity-50 rounded mx-1 sm:mx-2 my-1 text-xs sm:text-sm">{error}</p>}

      {/* The main chat window area takes up remaining space */}
      <div className="flex-grow overflow-hidden"> 
        <CyberLawChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isBotLoading={isLoading}
            botName={LEXMACHINA_BOT_NAME}
            botTypingMessage={LEXMACHINA_TYPING_MESSAGE}
            jurisdictionName={currentJurisdictionName}
            selectedJurisdiction={selectedJurisdiction}
            isWebSearchEnabled={isWebSearchEnabled}
            onToggleWebSearch={handleToggleWebSearch} 
        />
      </div>
       {isLoading && messages.length > 0 && messages[messages.length-1]?.sender === 'bot' && messages[messages.length-1].text === "" && (
         <div className="p-1 sm:p-2 text-center">
            <LoadingSpinner text={`${LEXMACHINA_TYPING_MESSAGE} for ${currentJurisdictionName}...`} />
         </div>
       )}
      
      <div className="p-1.5 sm:p-2 bg-hacker-border text-center text-[0.65rem] sm:text-xs text-hacker-gray font-roboto-mono">
        {LEXMACHINA_BOT_NAME} utilizes Gemini AI {isWebSearchEnabled ? "with web search" : ""} (web search {isWebSearchEnabled ? "enabled" : "disabled"}). Info is educational, not legal advice.
      </div>
    </div>
  );
};