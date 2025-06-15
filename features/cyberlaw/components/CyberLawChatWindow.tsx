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

  return (
    <div className="flex flex-col h-full bg-hacker-dark font-roboto-mono overflow-hidden border-2 border-hacker-border shadow-hacker-glow-cyan rounded">
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-1.5 sm:p-2 md:p-3 space-y-1 scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border"
        aria-live="polite"
      >
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