import React from 'react';
import { View, ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  onNewChat: () => void;
  chatSessions: ChatSession[];
  currentChatSessionId: string;
  onSelectChatSession: (sessionId: string) => void;
  onDeleteChatSession: (sessionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentView, 
  setCurrentView,
  onNewChat,
  chatSessions,
  currentChatSessionId,
  onSelectChatSession,
  onDeleteChatSession
}) => {
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    onClose(); // Close sidebar after selection on mobile
  };

  const handleNewChat = () => {
    onNewChat();
    onClose(); // Close sidebar after action
  };

  const handleSelectChat = (sessionId: string) => {
    onSelectChatSession(sessionId);
    onClose(); // Close sidebar after selection on mobile
  };

  const handleDeleteChat = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent triggering the select action
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteChatSession(sessionId);
    }
  };

  const formatChatTitle = (session: ChatSession): string => {
    if (session.title !== 'New Chat') {
      return session.title;
    }
    
    // If it's still "New Chat", try to use the first user message
    const firstUserMessage = session.messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      // Truncate long messages
      const truncated = firstUserMessage.text.length > 30 
        ? firstUserMessage.text.substring(0, 30) + '...'
        : firstUserMessage.text;
      return truncated;
    }
    
    return 'New Chat';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-share-tech-mono text-hacker-gray uppercase">
                Chat History
              </h3>
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded transition-all duration-200 text-hacker-gray hover:text-hacker-cyan hover:bg-hacker-dark border border-transparent hover:border-hacker-cyan"
                title="Start new chat"
                aria-label="Start new chat with Cyber Law AI"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full text-left p-2.5 rounded transition-all duration-200 font-share-tech-mono text-xs border border-dashed border-hacker-gray hover:border-hacker-cyan hover:bg-hacker-dark text-hacker-gray hover:text-hacker-cyan"
              >
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14"/>
                    <path d="M5 12h14"/>
                  </svg>
                  <span>New Chat</span>
                </div>
              </button>
              
              {/* Chat Sessions List */}
              {chatSessions.length > 0 ? (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-2.5 rounded transition-all duration-200 font-share-tech-mono text-xs cursor-pointer border
                      ${session.id === currentChatSessionId
                        ? 'bg-hacker-cyan text-hacker-dark border-hacker-cyan'
                        : 'text-hacker-gray hover:text-hacker-cyan hover:bg-hacker-dark border-transparent hover:border-hacker-gray'
                      }`}
                    onClick={() => handleSelectChat(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {formatChatTitle(session)}
                        </div>
                        <div className={`text-xs opacity-75 flex items-center gap-1 mt-0.5
                          ${session.id === currentChatSessionId ? 'text-hacker-dark' : 'text-hacker-gray'}
                        `}>
                          <span className="truncate">{session.jurisdiction}</span>
                          <span>•</span>
                          <span>{formatDate(session.updatedAt)}</span>
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteChat(e, session.id)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 hover:bg-hacker-red hover:text-white
                          ${session.id === currentChatSessionId ? 'text-hacker-dark hover:text-white' : 'text-hacker-gray'}
                        `}
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-hacker-gray italic">
                  No chat history available yet.
                </div>
              )}
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