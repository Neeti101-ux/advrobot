import React, { useState } from 'react';
import { View } from './types';
import { JailbreakDashboard } from './features/jailbreak/JailbreakDashboard';
import { CyberLawAssistantDashboard } from './features/cyberlaw/CyberLawAssistantDashboard';
import { Sidebar } from './components/Sidebar';
import { APP_TITLE } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CyberLaw);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
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
            
            <h1 className="text-base sm:text-lg md:text-xl font-share-tech-mono text-hacker-accent">
              {APP_TITLE}
            </h1>
          </div>
          
          <span className="text-xs text-hacker-gray font-roboto-mono hidden sm:block">
            Powered by UB Intelligence
          </span>
        </header>

        <main className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border">
          {currentView === View.Jailbreak && <JailbreakDashboard />}
          {currentView === View.CyberLaw && <CyberLawAssistantDashboard />}
        </main>
        
        <footer className="p-1.5 sm:p-2 bg-hacker-border text-center text-[0.65rem] sm:text-xs text-hacker-gray font-roboto-mono lg:hidden">
          System Status: <span className="text-hacker-green">OPERATIONAL</span> | v0.2.1 (Mobile-Enhanced)
        </footer>
      </div>
    </div>
  );
};

export default App;