import React, { useState, useEffect } from 'react';
import { View, ChatSession, Jurisdiction } from './types';
import { JailbreakDashboard } from './features/jailbreak/JailbreakDashboard';
import { CyberLawAssistantDashboard } from './features/cyberlaw/CyberLawAssistantDashboard';
import { Sidebar } from './components/Sidebar';
import { APP_TITLE, JURISDICTIONS_LIST } from './constants';

const CHAT_SESSIONS_STORAGE_KEY = 'advRobotChatSessions';
const CURRENT_CHAT_SESSION_STORAGE_KEY = 'advRobotCurrentChatSession';

const createNewChatSession = (jurisdiction: Jurisdiction = Jurisdiction.India): ChatSession => {
  const now = new Date().toISOString();
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'New Chat',
    messages: [],
    jurisdiction,
    createdAt: now,
    updatedAt: now,
  };
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CyberLaw);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string>('');

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
      const storedCurrentId = localStorage.getItem(CURRENT_CHAT_SESSION_STORAGE_KEY);
      
      if (storedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
        setChatSessions(parsedSessions);
        
        if (storedCurrentId && parsedSessions.find(s => s.id === storedCurrentId)) {
          setCurrentChatSessionId(storedCurrentId);
        } else if (parsedSessions.length > 0) {
          setCurrentChatSessionId(parsedSessions[0].id);
        } else {
          // Create initial session if none exist
          const initialSession = createNewChatSession();
          setChatSessions([initialSession]);
          setCurrentChatSessionId(initialSession.id);
        }
      } else {
        // Create initial session if no stored sessions
        const initialSession = createNewChatSession();
        setChatSessions([initialSession]);
        setCurrentChatSessionId(initialSession.id);
      }
    } catch (error) {
      console.error('Failed to load chat sessions from localStorage:', error);
      // Fallback: create initial session
      const initialSession = createNewChatSession();
      setChatSessions([initialSession]);
      setCurrentChatSessionId(initialSession.id);
    }
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      try {
        localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(chatSessions));
      } catch (error) {
        console.error('Failed to save chat sessions to localStorage:', error);
      }
    }
  }, [chatSessions]);

  // Save current chat session ID to localStorage whenever it changes
  useEffect(() => {
    if (currentChatSessionId) {
      try {
        localStorage.setItem(CURRENT_CHAT_SESSION_STORAGE_KEY, currentChatSessionId);
      } catch (error) {
        console.error('Failed to save current chat session ID to localStorage:', error);
      }
    }
  }, [currentChatSessionId]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleNewChat = () => {
    const newSession = createNewChatSession();
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentChatSessionId(newSession.id);
    
    // Switch to Cyber Law view if not already there
    if (currentView !== View.CyberLaw) {
      setCurrentView(View.CyberLaw);
    }
  };

  const handleSelectChatSession = (sessionId: string) => {
    setCurrentChatSessionId(sessionId);
    // Switch to Cyber Law view when selecting a chat
    if (currentView !== View.CyberLaw) {
      setCurrentView(View.CyberLaw);
    }
  };

  const updateChatSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updatedAt: new Date().toISOString() }
        : session
    ));
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      
      // If we're deleting the current session, switch to another one or create new
      if (sessionId === currentChatSessionId) {
        if (filtered.length > 0) {
          setCurrentChatSessionId(filtered[0].id);
        } else {
          const newSession = createNewChatSession();
          setChatSessions([newSession]);
          setCurrentChatSessionId(newSession.id);
          return [newSession];
        }
      }
      
      return filtered;
    });
  };

  const currentChatSession = chatSessions.find(session => session.id === currentChatSessionId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        currentChatSessionId={currentChatSessionId}
        onSelectChatSession={handleSelectChatSession}
        onDeleteChatSession={deleteChatSession}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="p-2 sm:p-3 bg-hacker-border shadow-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-hacker-gray hover:text-hacker-green transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            
            <div className="flex items-center gap-2">
              <img 
                src="/AdvRobot Logo.png" 
                alt="Adv.Robot Logo" 
                className="h-8 w-auto sm:h-10 md:h-12"
              />
              <h1 className="text-base sm:text-lg md:text-xl font-share-tech-mono text-hacker-accent">
                {APP_TITLE}
              </h1>
            </div>
          </div>
          
          <span className="text-xs text-hacker-gray font-roboto-mono hidden sm:block">
            Powered by UB Intelligence
          </span>
        </header>

        <main className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border">
          {currentView === View.Jailbreak && <JailbreakDashboard />}
          {currentView === View.CyberLaw && currentChatSession && (
            <CyberLawAssistantDashboard 
              chatSession={currentChatSession}
              onUpdateChatSession={updateChatSession}
            />
          )}
        </main>
        
        <footer className="p-1.5 sm:p-2 bg-hacker-border text-center text-[0.65rem] sm:text-xs text-hacker-gray font-roboto-mono lg:hidden">
          System Status: <span className="text-hacker-green">OPERATIONAL</span> | v0.2.1 (Mobile-Enhanced)
        </footer>
      </div>
    </div>
  );
};

export default App;