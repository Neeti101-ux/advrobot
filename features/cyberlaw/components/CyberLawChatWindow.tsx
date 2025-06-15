import React, { useEffect, useRef } from 'react';
import { Message, Jurisdiction } from '../../../types';
import { CyberLawChatMessage } from './CyberLawChatMessage'; // Specific message component
import { CyberLawChatInputBar } from './CyberLawChatInputBar'; // Specific input bar
import { LoadingSpinner } from '../../../components/LoadingSpinner';

interface CyberLawChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isBotLoading: boolean;
  botName: string;
  botTypingMessage: string;
  jurisdictionName: string; 
  selectedJurisdiction: Jurisdiction; 
  isWebSearchEnabled: boolean; 
  onToggleWebSearch: () => void; 
}

const EmptyState: React.FC<{ jurisdictionName: string; botName: string }> = ({ jurisdictionName, botName }) => (
  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
    <div className="mb-4">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth="1" 
        stroke="currentColor" 
        className="w-16 h-16 sm:w-20 sm:h-20 text-hacker-cyan opacity-60 mx-auto mb-3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    </div>
    <h3 className="text-lg sm:text-xl font-share-tech-mono text-hacker-cyan mb-2">
      Welcome to {botName}
    </h3>
    <p className="text-sm sm:text-base text-hacker-gray mb-4 max-w-md">
      I'm here to assist you with cyber law queries for <span className="text-hacker-green font-semibold">{jurisdictionName}</span>.
    </p>
    <div className="bg-hacker-border border border-hacker-gray rounded-lg p-3 sm:p-4 max-w-lg">
      <p className="text-xs sm:text-sm text-hacker-white font-roboto-mono mb-2">
        <span className="text-hacker-accent">💡 Try asking:</span>
      </p>
      <ul className="text-xs sm:text-sm text-hacker-gray space-y-1 text-left">
        <li>• "What are the data protection laws in {jurisdictionName}?"</li>
        <li>• "How to report a cybercrime?"</li>
        <li>• "What constitutes online harassment?"</li>
      </ul>
    </div>
    <p className="text-xs text-hacker-gray mt-4 opacity-75">
      Start typing your question below to begin our conversation.
    </p>
  </div>
);

export const CyberLawChatWindow: React.FC<CyberLawChatWindowProps> = ({ 
  messages, 
  onSendMessage, 
  isBotLoading,
  botName,
  botTypingMessage,
  jurisdictionName,
  selectedJurisdiction, 
  isWebSearchEnabled, 
  onToggleWebSearch   
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = chatContainerRef.current;
        if (scrollHeight - scrollTop < clientHeight + 250) { // Increased threshold more
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }
  }, [messages, isBotLoading]);

  // Filter out system messages for empty state check
  const nonSystemMessages = messages.filter(msg => msg.sender !== 'system');
  const isEmpty = nonSystemMessages.length === 0;

  return (
    <div className="flex flex-col h-full bg-hacker-dark font-roboto-mono overflow-hidden border-2 border-hacker-border shadow-hacker-glow-cyan rounded">
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-1.5 sm:p-2 md:p-3 space-y-1 scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border"
        aria-live="polite"
      >
        {isEmpty ? (
          <EmptyState jurisdictionName={jurisdictionName} botName={botName} />
        ) : (
          <>
            {messages.map((msg) => (
              <CyberLawChatMessage key={msg.id} message={msg} />
            ))}
            {isBotLoading && messages[messages.length-1]?.sender !== 'bot' && (
               <div className="flex justify-end">
                 <div className="p-2 sm:p-3 my-1.5 sm:my-2 max-w-[80%] rounded-md shadow-sm sm:shadow-md bg-hacker-border text-hacker-cyan self-end text-left font-share-tech-mono text-xs sm:text-sm">
                    <span className="animate-pulse">{botTypingMessage}</span>
                 </div>
               </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <CyberLawChatInputBar 
        onSendMessage={onSendMessage} 
        isLoading={isBotLoading}
        currentJurisdiction={selectedJurisdiction} 
        isWebSearchEnabled={isWebSearchEnabled} 
        onToggleWebSearch={onToggleWebSearch}   
      />
    </div>
  );
};