import React from 'react';
import { View } from '../types';
import { TabButton } from './TabButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentView, 
  setCurrentView 
}) => {
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    onClose(); // Close sidebar after selection on mobile
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-hacker-border border-r border-hacker-gray z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-hacker-gray flex justify-between items-center">
            <h2 className="text-lg font-share-tech-mono text-hacker-green">
              NAVIGATION
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-hacker-gray hover:text-hacker-red transition-colors"
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Features Section */}
          <div className="p-4 border-b border-hacker-gray">
            <h3 className="text-sm font-share-tech-mono text-hacker-gray mb-3 uppercase">
              Features
            </h3>
            <nav className="space-y-2">
              <button
                onClick={() => handleViewChange(View.Jailbreak)}
                className={`w-full text-left p-3 rounded transition-all duration-200 font-share-tech-mono text-sm
                  ${currentView === View.Jailbreak 
                    ? 'bg-hacker-red text-white border border-hacker-red' 
                    : 'text-hacker-gray hover:text-hacker-green hover:bg-hacker-dark border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  <div>
                    <div className="font-medium">Jailbreak Test</div>
                    <div className="text-xs opacity-75">Protocol Testing</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleViewChange(View.CyberLaw)}
                className={`w-full text-left p-3 rounded transition-all duration-200 font-share-tech-mono text-sm
                  ${currentView === View.CyberLaw 
                    ? 'bg-hacker-cyan text-hacker-dark border border-hacker-cyan' 
                    : 'text-hacker-gray hover:text-hacker-green hover:bg-hacker-dark border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <div>
                    <div className="font-medium">Cyber Law AI</div>
                    <div className="text-xs opacity-75">Legal Assistant</div>
                  </div>
                </div>
              </button>
            </nav>
          </div>

          {/* Chat History Section */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-sm font-share-tech-mono text-hacker-gray mb-3 uppercase">
              Chat History
            </h3>
            <div className="space-y-2">
              {/* Placeholder for chat history - this would be populated with actual chat sessions */}
              <div className="text-xs text-hacker-gray italic">
                No chat history available yet.
              </div>
              <div className="text-xs text-hacker-gray opacity-75">
                Start a conversation in Cyber Law AI to see your chat history here.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-hacker-gray">
            <div className="text-xs text-hacker-gray text-center">
              <div className="mb-1">System Status: <span className="text-hacker-green">OPERATIONAL</span></div>
              <div>v0.2.1 (Mobile-Enhanced)</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};