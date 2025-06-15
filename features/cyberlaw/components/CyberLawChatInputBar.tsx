import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Jurisdiction } from '../../../types';
import { CYBER_LAW_SUGGESTED_PROMPTS, CHATBOT_INPUT_PLACEHOLDER } from '../../../constants';

interface CyberLawChatInputBarProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  currentJurisdiction: Jurisdiction;
  isWebSearchEnabled: boolean;
  onToggleWebSearch: () => void;
}

const MIN_INPUT_FOR_SUGGESTIONS = 2;
const MAX_SUGGESTIONS_DISPLAYED = 4; // Slightly fewer for mobile

// Supported file types
const SUPPORTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'text/csv'],
  code: ['text/javascript', 'text/html', 'text/css', 'application/json', 'text/xml']
};

const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_FILE_TYPES.images,
  ...SUPPORTED_FILE_TYPES.documents,
  ...SUPPORTED_FILE_TYPES.code
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const CyberLawChatInputBar: React.FC<CyberLawChatInputBarProps> = ({ 
    onSendMessage, 
    isLoading,
    currentJurisdiction,
    isWebSearchEnabled,
    onToggleWebSearch
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [cyclingPlaceholder, setCyclingPlaceholder] = useState<string>(CHATBOT_INPUT_PLACEHOLDER);
  const [cyclingPlaceholderIndex, setCyclingPlaceholderIndex] = useState<number>(0);
  const cyclingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestionsBox, setShowSuggestionsBox] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALL_SUPPORTED_TYPES.includes(file.type)) {
      alert('Unsupported file type. Please upload images, PDFs, text files, or code files.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size too large. Please upload files smaller than 5MB.');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (SUPPORTED_FILE_TYPES.images.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = useCallback((textToSubmit: string, fileToSubmit?: File) => {
    if ((textToSubmit.trim() || fileToSubmit) && !isLoading) {
      onSendMessage(textToSubmit.trim(), fileToSubmit);
      setInputText('');
      setSelectedFile(null);
      setFilePreview(null);
      setShowSuggestionsBox(false);
      setFilteredSuggestions([]);
      setActiveSuggestionIndex(-1);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      const relevantPrompts = CYBER_LAW_SUGGESTED_PROMPTS[currentJurisdiction] || [CHATBOT_INPUT_PLACEHOLDER];
      setCyclingPlaceholder(relevantPrompts[0]);
      setCyclingPlaceholderIndex(0);
      if (textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height
    }
  }, [isLoading, onSendMessage, currentJurisdiction]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(inputText, selectedFile || undefined);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

      {/* File Preview */}
      {selectedFile && (
        <div className="p-2 bg-hacker-border border border-hacker-green rounded-t-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {filePreview ? (
                <img 
                  src={filePreview} 
                  alt="File preview" 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border border-hacker-gray"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-hacker-dark border border-hacker-gray rounded flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-hacker-gray" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-hacker-green font-roboto-mono truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-hacker-gray">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="ml-2 p-1 text-hacker-red hover:text-hacker-accent transition-colors"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="p-1.5 sm:p-2 bg-hacker-border border-t border-hacker-gray">
        <div className={`flex items-end sm:items-center border border-hacker-green focus-within:shadow-hacker-glow-green ${selectedFile ? 'rounded-b' : 'rounded'}`}>
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-1.5 sm:p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-hacker-green hover:bg-hacker-dark disabled:opacity-50 disabled:cursor-not-allowed mr-1 self-stretch flex items-center transition-colors"
            title="Upload file (images, PDFs, code files)"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-4 h-4 sm:w-5 sm:h-5 text-hacker-green"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={ALL_SUPPORTED_TYPES.join(',')}
            className="hidden"
            disabled={isLoading}
          />

          <textarea
            ref={textareaRef}
            value={inputText}
            onInput={handleInput}
            placeholder={placeholderTextToShow}
            disabled={isLoading}
            className="flex-grow p-1.5 sm:p-2 text-xs sm:text-sm bg-hacker-dark text-hacker-white placeholder-hacker-gray focus:outline-none focus:ring-1 focus:ring-hacker-accent focus:border-hacker-accent font-roboto-mono resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border transition-colors duration-200"
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
            disabled={isLoading || (!inputText.trim() && !selectedFile)}
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