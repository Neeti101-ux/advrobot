import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Jurisdiction } from '../../../types';
import { CYBER_LAW_SUGGESTED_PROMPTS, CHATBOT_INPUT_PLACEHOLDER } from '../../../constants';

interface CyberLawChatInputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  currentJurisdiction: Jurisdiction;
  isWebSearchEnabled: boolean;
  onToggleWebSearch: () => void;
}

const MIN_INPUT_FOR_SUGGESTIONS = 2;
const MAX_SUGGESTIONS_DISPLAYED = 4; // Slightly fewer for mobile

export const CyberLawChatInputBar: React.FC<CyberLawChatInputBarProps> = ({ 
    onSendMessage, 
    isLoading,
    currentJurisdiction,
    isWebSearchEnabled,
    onToggleWebSearch
}) => {
  const [inputText, setInputText] = useState('');
  const [cyclingPlaceholder, setCyclingPlaceholder] = useState<string>(CHATBOT_INPUT_PLACEHOLDER);
  const [cyclingPlaceholderIndex, setCyclingPlaceholderIndex] = useState<number>(0);
  const cyclingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestionsBox, setShowSuggestionsBox] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    const relevantPrompts = CYBER_LAW_SUGGESTED_PROMPTS[currentJurisdiction] || [CHATBOT_INPUT_PLACEHOLDER];
    if (cyclingIntervalRef.current) clearInterval(cyclingIntervalRef.current);

    if (!isLoading && inputText.trim() === "" && !showSuggestionsBox) {
      setCyclingPlaceholder(relevantPrompts[cyclingPlaceholderIndex % relevantPrompts.length]);
      cyclingIntervalRef.current = setInterval(() => {
        setCyclingPlaceholderIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % relevantPrompts.length;
          setCyclingPlaceholder(relevantPrompts[nextIndex]);
          return nextIndex;
        });
      }, 7000);
    } else {
        if (inputText.trim() !== "" && !showSuggestionsBox) {
             setCyclingPlaceholder(CHATBOT_INPUT_PLACEHOLDER);
        }
    }
    return () => { if (cyclingIntervalRef.current) clearInterval(cyclingIntervalRef.current); };
  }, [currentJurisdiction, isLoading, inputText, showSuggestionsBox, cyclingPlaceholderIndex]);


  useEffect(() => {
    if (inputText.trim().length >= MIN_INPUT_FOR_SUGGESTIONS) {
      const allJurisdictionPrompts = CYBER_LAW_SUGGESTED_PROMPTS[currentJurisdiction] || [];
      const lowerInputText = inputText.toLowerCase();
      const newFiltered = allJurisdictionPrompts.filter(prompt => 
        prompt.toLowerCase().includes(lowerInputText)
      ).slice(0, MAX_SUGGESTIONS_DISPLAYED);

      setFilteredSuggestions(newFiltered);
      setShowSuggestionsBox(newFiltered.length > 0);
      setActiveSuggestionIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestionsBox(false);
    }
  }, [inputText, currentJurisdiction]);


  const handleSubmit = useCallback((textToSubmit: string) => {
    if (textToSubmit.trim() && !isLoading) {
      onSendMessage(textToSubmit.trim());
      setInputText('');
      setShowSuggestionsBox(false);
      setFilteredSuggestions([]);
      setActiveSuggestionIndex(-1);
      const relevantPrompts = CYBER_LAW_SUGGESTED_PROMPTS[currentJurisdiction] || [CHATBOT_INPUT_PLACEHOLDER];
      setCyclingPlaceholder(relevantPrompts[0]);
      setCyclingPlaceholderIndex(0);
      if (textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height
    }
  }, [isLoading, onSendMessage, currentJurisdiction]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(inputText);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion); 
    setShowSuggestionsBox(false);
    if (textareaRef.current) {
        textareaRef.current.focus(); // Keep focus on textarea
        // Optionally auto-submit: handleSubmit(suggestion);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestionsBox && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredSuggestions.length) {
          const selectedSuggestion = filteredSuggestions[activeSuggestionIndex];
          setInputText(selectedSuggestion); 
          setShowSuggestionsBox(false); 
          // handleSubmit(selectedSuggestion); // Optionally auto-submit
        } else {
          handleFormSubmit(e); 
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestionsBox(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };
  
  const placeholderTextToShow = isLoading 
    ? "Adv. Robot processing..." 
    : (showSuggestionsBox || inputText.trim() !== "" ? "" : cyclingPlaceholder);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto'; // Reset height
    const computed = window.getComputedStyle(textarea);
    const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                 + parseInt(computed.getPropertyValue('padding-top'), 10)
                 + textarea.scrollHeight
                 + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                 + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    textarea.style.height = `${Math.min(height, 80)}px`; // Max height of 80px for mobile
  };

  // Enhanced button text and styling for loading state
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-hacker-dark border-t-transparent rounded-full animate-spin"></div>
          <span className="hidden sm:inline">PROCESSING</span>
          <span className="sm:hidden">...</span>
        </div>
      );
    }
    return 'SEND';
  };

  return (
    <div className="relative"> 
      {showSuggestionsBox && filteredSuggestions.length > 0 && (
        <div 
            className="suggestion-box scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border"
            role="listbox"
            aria-labelledby="suggestion-label" 
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              role="option"
              id={`suggestion-item-${index}`}
              aria-selected={index === activeSuggestionIndex}
              className={`suggestion-item ${index === activeSuggestionIndex ? 'suggestion-item-active' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setActiveSuggestionIndex(index)} 
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleFormSubmit} className="p-1.5 sm:p-2 bg-hacker-border border-t border-hacker-gray">
        <div className="flex items-end sm:items-center border border-hacker-green rounded focus-within:shadow-hacker-glow-green">
          <textarea
            ref={textareaRef}
            value={inputText}
            onInput={handleInput}
            placeholder={placeholderTextToShow}
            disabled={isLoading}
            className="flex-grow p-1.5 sm:p-2 text-xs sm:text-sm bg-hacker-dark text-hacker-white placeholder-hacker-gray focus:outline-none focus:ring-1 focus:ring-hacker-accent focus:border-hacker-accent font-roboto-mono resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border transition-colors duration-200 rounded-l"
            rows={1} // Start with 1 row, JS will adjust
            onKeyDown={handleKeyDown}
            style={{ minHeight: '34px', maxHeight: '80px' }} // Max height for mobile
            aria-autocomplete="list"
            aria-controls="suggestion-listbox" 
            aria-expanded={showSuggestionsBox}
            aria-activedescendant={activeSuggestionIndex >=0 ? `suggestion-item-${activeSuggestionIndex}` : undefined}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 font-share-tech-mono rounded-r transition-all duration-200 disabled:cursor-not-allowed text-xs sm:text-sm self-stretch flex items-center justify-center min-w-[60px] sm:min-w-[80px] ${
              isLoading 
                ? 'bg-hacker-gray text-hacker-dark opacity-75' 
                : 'bg-hacker-green text-hacker-dark hover:bg-opacity-80 disabled:opacity-50'
            }`}
            aria-label="Send legal query"
          >
            {getButtonContent()}
          </button>
        </div>
      </form>
    </div>
  );
};