import React, { useState, useCallback, useEffect } from 'react';
import { Jurisdiction, Message, ChatSession } from '../../types';
import { JURISDICTIONS_LIST, LEXMACHINA_BOT_NAME, LEXMACHINA_TYPING_MESSAGE, DEFAULT_ERROR_MESSAGE } from '../../constants';
import { JurisdictionSelector } from './components/JurisdictionSelector';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { streamLegalAdvice } from '../../services/geminiService';
import { CyberLawChatWindow } from './components/CyberLawChatWindow';
import { GroundingChunk } from '@google/genai';

interface CyberLawAssistantDashboardProps {
  chatSession: ChatSession;
  onUpdateChatSession: (sessionId: string, updates: Partial<ChatSession>) => void;
}

export const CyberLawAssistantDashboard: React.FC<CyberLawAssistantDashboardProps> = ({
  chatSession,
  onUpdateChatSession
}) => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>(chatSession.jurisdiction);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState<boolean>(true);
  
  const currentJurisdictionName = JURISDICTIONS_LIST.find(j => j.id === selectedJurisdiction)?.name || selectedJurisdiction;

  // Initialize chat session if it's empty
  useEffect(() => {
    if (chatSession.messages.length === 0) {
      const systemMessage: Message = {
        id: 'system-intro-' + Date.now(),
        text: `${LEXMACHINA_BOT_NAME} activated for ${currentJurisdictionName}. Web search is currently ${isWebSearchEnabled ? "ENABLED" : "DISABLED"}. How can I assist with your cyber law query?`,
        sender: 'system',
        timestamp: new Date().toISOString(),
      };
      
      onUpdateChatSession(chatSession.id, {
        messages: [systemMessage],
        jurisdiction: selectedJurisdiction
      });
    }
  }, [chatSession.id, chatSession.messages.length, currentJurisdictionName, isWebSearchEnabled, onUpdateChatSession, selectedJurisdiction]);

  const handleToggleWebSearch = () => {
    setIsWebSearchEnabled(prev => !prev);
    const status = !isWebSearchEnabled ? "ENABLED" : "DISABLED";
    const systemMessage: Message = {
        id: 'system-websearch-toggle-' + Date.now(),
        text: `Web search feature has been ${status}.`,
        sender: 'system',
        timestamp: new Date().toISOString(),
    };
    
    onUpdateChatSession(chatSession.id, {
      messages: [...chatSession.messages, systemMessage]
    });
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    setError(null);
    const newUserMessage: Message = {
      id: 'user-' + Date.now(),
      text: userInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...chatSession.messages, newUserMessage];
    
    // Update chat session title if it's the first user message
    let sessionUpdates: Partial<ChatSession> = {
      messages: updatedMessages,
      jurisdiction: selectedJurisdiction
    };
    
    if (chatSession.title === 'New Chat') {
      const truncatedTitle = userInput.length > 30 
        ? userInput.substring(0, 30) + '...'
        : userInput;
      sessionUpdates.title = truncatedTitle;
    }
    
    onUpdateChatSession(chatSession.id, sessionUpdates);
    setIsLoading(true);

    const botMessageId = 'bot-' + Date.now();
    const botMessage: Message = { 
        id: botMessageId, 
        text: "", 
        sender: 'bot', 
        timestamp: new Date().toISOString(),
        sources: [] 
    };
    
    onUpdateChatSession(chatSession.id, {
      messages: [...updatedMessages, botMessage]
    });

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
        
        const currentMessages = [...updatedMessages, { ...botMessage, text: fullBotResponse, sources: finalSources }];
        onUpdateChatSession(chatSession.id, {
          messages: currentMessages
        });
      },
      (errorMsg) => {
        setError(errorMsg);
        const currentMessages = [...updatedMessages, { ...botMessage, text: `Error: ${errorMsg}`, glitch: false }];
        onUpdateChatSession(chatSession.id, {
          messages: currentMessages
        });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        if (!fullBotResponse && !error) {
          const currentMessages = [...updatedMessages, { ...botMessage, text: "I could not generate a response for this query. Please try rephrasing or try another query.", glitch: false }];
          onUpdateChatSession(chatSession.id, {
            messages: currentMessages
          });
        }
      }
    );
  }, [selectedJurisdiction, chatSession, isWebSearchEnabled, error, onUpdateChatSession]); 

  const handleJurisdictionChange = (newJurisdiction: Jurisdiction) => {
    setSelectedJurisdiction(newJurisdiction);
    setError(null); 
    setIsLoading(false);
    
    // Update the chat session jurisdiction
    onUpdateChatSession(chatSession.id, {
      jurisdiction: newJurisdiction
    });
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
            messages={chatSession.messages}
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
    </div>
  );
};