import React, { useState } from 'react';
import { View } from './types';
import { JailbreakDashboard } from './features/jailbreak/JailbreakDashboard';
import { CyberLawAssistantDashboard } from './features/cyberlaw/CyberLawAssistantDashboard';
import { TabButton } from './components/TabButton';
import { APP_TITLE } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CyberLaw);

  return (
    // The #root div in index.html handles the main flex column structure and height
    // This component's root div focuses on its direct children
    <div className="flex flex-col h-full overflow-hidden"> 
      <header className="p-2 sm:p-3 bg-hacker-border shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-base sm:text-lg md:text-xl font-share-tech-mono text-hacker-accent text-center sm:text-left self-center sm:self-auto">
          {APP_TITLE}
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2">
          <nav className="flex space-x-1" aria-label="Main navigation">
            <TabButton 
              label="Jailbreak Test" // Shortened for mobile
              isActive={currentView === View.Jailbreak} 
              onClick={() => setCurrentView(View.Jailbreak)}
            />
            <TabButton 
              label="Cyber Law AI" 
              isActive={currentView === View.CyberLaw} 
              onClick={() => setCurrentView(View.CyberLaw)}
            />
          </nav>
          <span className="text-xs text-hacker-gray font-roboto-mono mt-1 sm:mt-0">
            Powered by UB Intelligence
          </span>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border">
        {currentView === View.Jailbreak && <JailbreakDashboard />}
        {currentView === View.CyberLaw && <CyberLawAssistantDashboard />}
      </main>
      
      <footer className="p-1.5 sm:p-2 bg-hacker-border text-center text-[0.65rem] sm:text-xs text-hacker-gray font-roboto-mono">
        System Status: <span className="text-hacker-green">OPERATIONAL</span> | v0.2.1 (Mobile-Enhanced)
      </footer>
    </div>
  );
};

export default App;