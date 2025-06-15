import React from 'react';
import { Message } from '../../../types';
import { GroundingChunk } from '@google/genai';
import { marked } from 'marked'; // For rendering markdown

interface CyberLawChatMessageProps {
  message: Message;
}

const renderSourceLink = (chunk: GroundingChunk, index: number) => {
  if (chunk.web) {
    return (
      <li key={index} className="mb-0.5 text-[0.65rem] sm:text-xs">
        <a
          href={chunk.web.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-hacker-accent hover:text-hacker-green underline break-all"
          title={chunk.web.title}
        >
          [{index + 1}] {chunk.web.title || chunk.web.uri}
        </a>
      </li>
    );
  }
  return null;
};

export const CyberLawChatMessage: React.FC<CyberLawChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';
  const isSystem = message.sender === 'system';

  const baseStyle = "p-2 sm:p-3 my-1.5 sm:my-2 max-w-[85%] sm:max-w-[80%] rounded-md shadow-sm sm:shadow-md relative";
  // User messages: hacker-green text, semi-transparent hacker-green background
  const userStyle = "bg-hacker-green-transparent text-hacker-green self-start text-left border border-hacker-green message-bubble-user"; 
  // Bot messages: hacker-cyan text, custom darker background for differentiation
  const botStyle = `bg-hacker-bg-bot text-hacker-cyan self-end text-left message-bubble-bot`; 
  const systemStyle = "bg-transparent border border-dashed border-hacker-gray text-hacker-gray self-center text-center italic text-[0.7rem] sm:text-sm px-2 sm:px-4 py-1";

  let containerClass = "flex ";
  let messageClass = `${baseStyle} font-roboto-mono text-xs sm:text-sm`; // Roboto Mono for readability of legal text

  if (isUser) {
    containerClass += "justify-start";
    messageClass += ` ${userStyle}`;
  } else if (isBot) {
    containerClass += "justify-end"; // Bot messages align to the right
    messageClass += ` ${botStyle}`;
  } else { // System
    containerClass += "justify-center";
    messageClass += ` ${systemStyle}`;
  }
  
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Use `dangerouslySetInnerHTML` for markdown after sanitizing/trusting `marked`
  // For bot messages, apply .prose-cyberlaw for markdown styling defined in index.html
  const botResponseHtml = isBot ? marked.parse(message.text) : null;

  return (
    <div className={containerClass}>
      <div className={messageClass} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {isBot && <span className="absolute top-0.5 sm:top-1 right-1 sm:right-2 text-[0.6rem] sm:text-xs text-hacker-gray font-roboto-mono opacity-70">{formattedTime}</span>}
        {isUser && <span className="absolute top-0.5 sm:top-1 left-1 sm:left-2 text-[0.6rem] sm:text-xs text-hacker-gray font-roboto-mono opacity-70">{formattedTime}</span>}
        
        {isUser && <span className="font-share-tech-mono text-xs sm:text-sm">{message.text}</span>}
        {isSystem && <span className="font-share-tech-mono">{message.text}</span>}
        
        {isBot && botResponseHtml && (
          <div className="prose-cyberlaw" dangerouslySetInnerHTML={{ __html: botResponseHtml }} />
        )}
        {isBot && message.sources && message.sources.length > 0 && (
          <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-hacker-gray border-opacity-50">
            <h4 className="text-[0.7rem] sm:text-sm font-share-tech-mono text-hacker-gray mb-0.5 sm:mb-1">Sources:</h4>
            <ul className="list-none pl-0 space-y-0.5">
              {message.sources.map(renderSourceLink)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};