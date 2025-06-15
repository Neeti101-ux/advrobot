import React, { useState, useEffect, useCallback } from 'react';
import { JailbreakLevelState, JailbreakLevelDefinition } from '../../types';
import { JAILBREAK_LEVELS, APP_TITLE } from '../../constants';
import { LevelDisplay } from './components/LevelDisplay';
import { StyledButton } from '../../components/StyledButton';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const LOCAL_STORAGE_KEY = 'mrRobotJailbreakProgress';

const initializeLevelStates = (): JailbreakLevelState[] => {
  return JAILBREAK_LEVELS.map((def, index) => ({
    ...def,
    isCompleted: false,
    isUnlocked: index === 0, // First level is initially unlocked
  }));
};

const loadProgressFromStorage = (): { currentLevelId: number; levels: JailbreakLevelState[] } | null => {
  try {
    const storedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedProgress) {
      const parsed = JSON.parse(storedProgress);
      // Basic validation
      if (parsed && typeof parsed.currentLevelId === 'number' && Array.isArray(parsed.levels)) {
        // Ensure loaded levels match current definitions (e.g., if new levels were added)
        const currentLevelDefinitions = initializeLevelStates();
        const mergedLevels = currentLevelDefinitions.map(defLevel => {
          const foundStoredLevel = parsed.levels.find((sl: JailbreakLevelState) => sl.id === defLevel.id);
          return foundStoredLevel ? 
            { ...defLevel, isCompleted: foundStoredLevel.isCompleted, isUnlocked: foundStoredLevel.isUnlocked } 
            : defLevel;
        });
         // Re-evaluate unlocked status based on completion
        for (let i = 0; i < mergedLevels.length; i++) {
            if (i === 0) mergedLevels[i].isUnlocked = true;
            else mergedLevels[i].isUnlocked = mergedLevels[i-1].isCompleted;
        }
        
        let currentId = parsed.currentLevelId;
        const targetLevel = mergedLevels.find(l => l.id === currentId);
        if (!targetLevel || !targetLevel.isUnlocked) {
            currentId = mergedLevels.find(l => l.isUnlocked && !l.isCompleted)?.id || mergedLevels[0].id;
        }

        return { currentLevelId: currentId, levels: mergedLevels };
      }
    }
  } catch (error) {
    console.error("Failed to load jailbreak progress from local storage:", error);
  }
  return null;
};

export const JailbreakDashboard: React.FC = () => {
  const [levels, setLevels] = useState<JailbreakLevelState[]>(initializeLevelStates());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadedProgress = loadProgressFromStorage();
    if (loadedProgress) {
      setLevels(loadedProgress.levels);
      setCurrentLevelId(loadedProgress.currentLevelId);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) { // Avoid saving initial default state before loading
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ currentLevelId, levels }));
      } catch (error) {
        console.error("Failed to save jailbreak progress to local storage:", error);
      }
    }
  }, [currentLevelId, levels, isLoading]);

  const handleReportSuccess = useCallback(() => {
    setLevels(prevLevels => {
      const newLevels = prevLevels.map(level =>
        level.id === currentLevelId ? { ...level, isCompleted: true } : level
      );
      // Unlock next level if current one is completed
      const currentIdx = newLevels.findIndex(l => l.id === currentLevelId);
      if (currentIdx !== -1 && newLevels[currentIdx].isCompleted && currentIdx + 1 < newLevels.length) {
        newLevels[currentIdx + 1].isUnlocked = true;
      }
      return newLevels;
    });
  }, [currentLevelId]);

  const handleGoNextLevel = useCallback(() => {
    const currentIndex = levels.findIndex(l => l.id === currentLevelId);
    if (currentIndex !== -1 && levels[currentIndex].isCompleted) {
      const nextLevel = levels.find(l => l.id > currentLevelId && l.isUnlocked);
      if (nextLevel) {
        setCurrentLevelId(nextLevel.id);
      }
    }
  }, [currentLevelId, levels]);
  
  const handleLevelSelect = (levelId: number) => {
    const selectedLevel = levels.find(l => l.id === levelId);
    if (selectedLevel && selectedLevel.isUnlocked) {
      setCurrentLevelId(levelId);
    }
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset all jailbreak progress? This action cannot be undone.")) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        const initialLevels = initializeLevelStates();
        setLevels(initialLevels);
        setCurrentLevelId(initialLevels[0].id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading Jailbreak Module..." />;
  }

  const currentLevel = levels.find(l => l.id === currentLevelId);
  if (!currentLevel) {
    return <div className="p-2 sm:p-4 text-hacker-red">Error: Current level data not found. Try resetting progress.</div>;
  }

  const completedLevelsCount = levels.filter(l => l.isCompleted).length;
  const totalLevels = levels.length;
  const overallProgressPercentage = totalLevels > 0 ? (completedLevelsCount / totalLevels) * 100 : 0;
  const allLevelsCompleted = completedLevelsCount === totalLevels;

  return (
    <div className="p-2 sm:p-4 md:p-6 h-full flex flex-col text-hacker-white font-roboto-mono">
      <div className="flex flex-col xs:flex-row justify-between items-center mb-3 sm:mb-4 gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-share-tech-mono text-hacker-red text-center xs:text-left">
          JAILBREAK PROTOCOL TESTING
        </h1>
        <StyledButton onClick={resetProgress} variant="secondary" className="!py-1.5 !px-2 text-[0.7rem] sm:!py-2 sm:!px-3 sm:text-xs self-center xs:self-auto">
            Reset Progress
        </StyledButton>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-2 sm:mb-3">
          <div className="flex justify-between text-[0.65rem] sm:text-xs text-hacker-gray mb-1">
            <span>Overall Progress</span>
            <span>{completedLevelsCount} / {totalLevels} Levels</span>
          </div>
          <div className="overall-progress-bar-container">
            <div 
              className="overall-progress-bar-fill" 
              style={{ width: `${overallProgressPercentage}%` }}
              role="progressbar"
              aria-valuenow={overallProgressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall jailbreak progress"
            ></div>
          </div>
      </div>
      
      {/* Level Navigator Tabs */}
      <div className="mb-3 sm:mb-4 flex flex-wrap gap-1 border-b-2 border-hacker-border pb-1 sm:pb-2">
        {levels.map(level => (
          <button
            key={level.id}
            onClick={() => handleLevelSelect(level.id)}
            disabled={!level.isUnlocked}
            className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[0.6rem] xxs:text-[0.7rem] sm:text-xs font-share-tech-mono rounded transition-colors
                        ${level.isUnlocked ? 'hover:bg-hacker-gray' : 'text-hacker-gray cursor-not-allowed'}
                        ${level.id === currentLevelId ? 'bg-hacker-red text-white ring-1 sm:ring-2 ring-hacker-accent' : (level.isCompleted ? 'bg-hacker-green text-hacker-dark' : 'bg-hacker-border text-hacker-gray')}
                        ${!level.isUnlocked ? 'opacity-50' : ''}`}
            title={level.isUnlocked ? (level.isCompleted ? `${level.name} (Completed)` : level.name) : `${level.name} (Locked)`}
            aria-current={level.id === currentLevelId ? "page" : undefined}
          >
            LVL {level.id}
          </button>
        ))}
      </div>

      <LevelDisplay
        level={currentLevel}
        onReportSuccess={handleReportSuccess}
        onGoNextLevel={handleGoNextLevel}
        isLastLevel={currentLevelId === levels[levels.length - 1].id}
        allLevelsCompleted={allLevelsCompleted}
      />

      {allLevelsCompleted && (
         <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-hacker-green text-hacker-dark rounded shadow-hacker-glow-green text-center">
            <h2 className="text-lg sm:text-xl font-share-tech-mono">ALL PROTOCOLS TESTED!</h2>
            <p className="text-xs sm:text-sm">You have successfully navigated all jailbreak levels. System integrity enhanced.</p>
        </div>
      )}

      <div className="mt-auto pt-3 sm:pt-4 text-center">
        <p className="text-[0.65rem] sm:text-xs text-hacker-gray">
          Copy prompts and test them in your own LLM environment. Report success to proceed.
          This ensures your API keys and data remain secure with you.
        </p>
      </div>
    </div>
  );
};