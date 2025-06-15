import React from 'react';
import { useState } from 'react';
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
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'thumbs-up' | 'thumbs-down' | null>(null);
  
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';
  const isSystem = message.sender === 'system';
  const isLoadingBot = isBot && message.text === "";

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

  // Process bot message text to remove duplicate sources section
  // The expandable sources section below handles source display
  let processedBotText = message.text;
  if (isBot && message.text) {
    // Remove everything from "Sources:" onwards (case-insensitive)
    const sourcesIndex = message.text.toLowerCase().indexOf('sources:');
    if (sourcesIndex !== -1) {
      processedBotText = message.text.substring(0, sourcesIndex).trim();
    }
  }
  
  // Use `dangerouslySetInnerHTML` for markdown after sanitizing/trusting `marked`
  // For bot messages, apply .prose-cyberlaw for markdown styling defined in index.html
  const botResponseHtml = isBot ? marked.parse(processedBotText) : null;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedBotText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  
  const handleFeedback = (type: 'thumbs-up' | 'thumbs-down') => {
    setFeedback(feedback === type ? null : type);
    // Here you could send feedback to analytics or logging service
    console.log(`User feedback for message ${message.id}: ${type}`);
  };

  return (
    <div className={containerClass}>
      <div className={messageClass} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {isBot && <span className="absolute top-0.5 sm:top-1 right-1 sm:right-2 text-[0.6rem] sm:text-xs text-hacker-gray font-roboto-mono opacity-70">{formattedTime}</span>}
        {isUser && <span className="absolute top-0.5 sm:top-1 left-1 sm:left-2 text-[0.6rem] sm:text-xs text-hacker-gray font-roboto-mono opacity-70">{formattedTime}</span>}
        
        {isUser && <span className="font-share-tech-mono text-xs sm:text-sm">{message.text}</span>}
        {isSystem && <span className="font-share-tech-mono">{message.text}</span>}
        
        {isBot && !isLoadingBot && botResponseHtml && (
          <>
            <div className="prose-cyberlaw" dangerouslySetInnerHTML={{ __html: botResponseHtml }} />
            
            {/* Feedback and Copy Buttons */}
            <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-hacker-gray border-opacity-30">
              <button
                onClick={() => handleFeedback('thumbs-up')}
                className={`p-1.5 rounded transition-all duration-200 hover:bg-hacker-border ${
                  feedback === 'thumbs-up' 
                    ? 'text-hacker-green bg-hacker-border' 
                    : 'text-hacker-gray hover:text-hacker-green'
                }`}
                title="Good response"
                aria-label="Mark response as helpful"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10v12"/>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                </svg>
              </button>
              
              <button
                onClick={() => handleFeedback('thumbs-down')}
                className={`p-1.5 rounded transition-all duration-200 hover:bg-hacker-border ${
                  feedback === 'thumbs-down' 
                    ? 'text-hacker-red bg-hacker-border' 
                    : 'text-hacker-gray hover:text-hacker-red'
                }`}
                title="Poor response"
                aria-label="Mark response as not helpful"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 14V2"/>
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
                </svg>
              </button>
              
              <div className="w-px h-4 bg-hacker-gray opacity-30 mx-1"></div>
              
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded transition-all duration-200 hover:bg-hacker-border ${
                  copied 
                    ? 'text-hacker-green bg-hacker-border' 
                    : 'text-hacker-gray hover:text-hacker-cyan'
                }`}
                title={copied ? "Copied!" : "Copy response"}
                aria-label="Copy response to clipboard"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
        
        {isLoadingBot && (
          <div className="flex items-center gap-2 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-hacker-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-hacker-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-hacker-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-hacker-cyan font-share-tech-mono text-xs animate-pulse">
              Analyzing legal framework...
            </span>
          </div>
        )}
        
        {isBot && message.sources && message.sources.length > 0 && (
          <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-hacker-gray border-opacity-50">
            <details className="group">
              <summary className="text-[0.7rem] sm:text-sm font-share-tech-mono text-hacker-gray mb-0.5 sm:mb-1 cursor-pointer hover:text-hacker-green transition-colors duration-200 flex items-center gap-1">
                <span className="inline-block transform transition-transform duration-200 group-open:rotate-90">▶</span>
                Sources ({message.sources.length})
              </summary>
              <ul className="list-none pl-0 space-y-0.5 mt-1">
                {message.sources.map(renderSourceLink)}
              </ul>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};