import React, { useState, useEffect, useRef } from 'react';
import { JailbreakLevelState } from '../../../types';
import { StyledButton } from '../../../components/StyledButton';

// Helper function to calculate animation speed (duration)
const calculateAnimationSpeed = (levelId: number): number => {
  // Base duration of 4s, decreases by 0.15s per level, minimum 1s.
  return Math.max(1, 4 - levelId * 0.15);
};

interface LevelDisplayProps {
  level: JailbreakLevelState;
  onReportSuccess: () => void;
  onGoNextLevel: () => void;
  isLastLevel: boolean;
  allLevelsCompleted: boolean;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ 
    level, 
    onReportSuccess, 
    onGoNextLevel,
    isLastLevel,
    allLevelsCompleted
}) => {
  const [promptCopied, setPromptCopied] = useState(false);
  const robotElementRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const [isWalkAnimationTriggered, setIsWalkAnimationTriggered] = useState(false);

  // Reset animation trigger when the level itself changes
  useEffect(() => {
    setIsWalkAnimationTriggered(false);
  }, [level.id]);

  useEffect(() => {
    const robotElement = robotElementRef.current;
    const progressFill = progressFillRef.current;
    if (!robotElement || !progressFill) return;

    const walkAnimationDurationSeconds = calculateAnimationSpeed(level.id);
    const walkAnimationDurationMs = walkAnimationDurationSeconds * 1000;

    // Reset styles
    robotElement.style.transform = '';
    robotElement.style.transition = '';
    progressFill.style.width = '';
    progressFill.style.backgroundColor = '';
    progressFill.style.transition = '';

    if (level.isCompleted) {
      // Level is completed - robot at the end, green fill
      robotElement.style.transform = 'translateX(calc(100vw - 100% - 20px))';
      progressFill.style.width = '100%';
      progressFill.style.backgroundColor = 'rgba(23, 195, 178, 0.4)'; // hacker-green
    } else if (isWalkAnimationTriggered) {
      // Start animation
      robotElement.style.transition = `transform ${walkAnimationDurationSeconds}s ease-in-out`;
      progressFill.style.transition = `width ${walkAnimationDurationSeconds}s ease-in-out, background-color 0.5s ease-in-out`;
      
      // Trigger animation
      setTimeout(() => {
        if (robotElement && progressFill) {
          robotElement.style.transform = 'translateX(calc(100vw - 100% - 20px))';
          progressFill.style.width = '100%';
        }
      }, 50);

      const walkEndTimer = setTimeout(() => {
        if (progressFill) {
          progressFill.style.backgroundColor = 'rgba(23, 195, 178, 0.4)'; // Change to green
        }
        onReportSuccess(); 
      }, walkAnimationDurationMs);

      return () => clearTimeout(walkEndTimer); 
    } else {
      // Initial state - robot at start, no fill
      robotElement.style.transform = 'translateX(0)';
      progressFill.style.width = '0%';
      progressFill.style.backgroundColor = 'rgba(214, 40, 40, 0.3)'; // hacker-red
    }
  }, [level.id, level.isCompleted, isWalkAnimationTriggered, onReportSuccess]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(level.instructionPrompt)
      .then(() => {
        setPromptCopied(true);
        setTimeout(() => setPromptCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy prompt: ', err));
  };

  const handleSuccessCheckboxChange = () => {
    if (!level.isCompleted && !isWalkAnimationTriggered) {
      setIsWalkAnimationTriggered(true);
    }
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 bg-hacker-border rounded-lg shadow-hacker-glow-red flex-grow flex flex-col">
      <h2 className="text-base sm:text-lg md:text-xl font-share-tech-mono text-hacker-red mb-0.5 sm:mb-1">
        {level.name}
      </h2>
      <p className="text-[0.7rem] sm:text-xs text-hacker-gray mb-0.5 sm:mb-1 font-roboto-mono">Protocol: <span className="text-hacker-green">{level.protocolName}</span></p>
      <p className="text-[0.7rem] sm:text-xs text-hacker-gray mb-1.5 sm:mb-2 md:mb-3 font-roboto-mono">{level.description}</p>

      {/* Animation Box */}
      <div className="robot-progress-container mb-1.5 sm:mb-2 md:mb-4">
        {/* Progress Fill Background */}
        <div 
          ref={progressFillRef}
          className="robot-level-fill"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '0%',
            backgroundColor: 'rgba(214, 40, 40, 0.3)',
            zIndex: 0
          }}
        />
        
        {/* Animated Robot */}
        <div 
          ref={robotElementRef}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10"
          style={{
            width: '40px',
            height: '40px'
          }}
        >
          <img 
            src="/Animated robot.gif" 
            alt="Animated Robot" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="mb-1 text-center min-h-[18px] sm:min-h-[20px] md:min-h-[24px]">
       {level.isCompleted ? (
          <p className="text-hacker-cyan font-share-tech-mono text-[0.7rem] sm:text-xs md:text-sm success-feedback">
            Objective Met! System Integrity Enhanced.
          </p>
        ) : (
          <p className="text-hacker-cyan font-share-tech-mono text-[0.7rem] sm:text-xs md:text-sm">
            {isWalkAnimationTriggered ? "Processing Confirmation..." : "Test In Progress... Awaiting Confirmation."}
          </p>
        )}
      </div>

      <div className="mb-1.5 sm:mb-2 md:mb-4">
        <label className="block text-[0.7rem] sm:text-xs font-medium text-hacker-gray mb-0.5 sm:mb-1 font-share-tech-mono">SYSTEM PROMPT PROTOCOL:</label>
        <textarea
            readOnly
            value={level.instructionPrompt}
            className="w-full p-1.5 sm:p-2 bg-hacker-dark text-hacker-green border border-hacker-green rounded focus:outline-none font-roboto-mono resize-none h-32 xs:h-36 sm:h-40 md:h-48 text-[0.65rem] sm:text-xs scrollbar-thin scrollbar-thumb-hacker-gray scrollbar-track-hacker-border"
        />
        <StyledButton 
            onClick={handleCopyPrompt} 
            variant="secondary" 
            className="w-full mt-1.5 sm:mt-2 !py-1.5 sm:!py-2 text-[0.7rem] sm:text-xs"
        >
          {promptCopied ? 'PROMPT COPIED!' : 'COPY PROMPT'}
        </StyledButton>
      </div>
      
      <div className="mt-auto space-y-1.5 sm:space-y-2 md:space-y-3">
        {!level.isCompleted && (
          <div className="flex items-center justify-center p-1.5 sm:p-2 bg-hacker-dark rounded border border-hacker-red">
            <input 
              type="checkbox" 
              id={`success-${level.id}`} 
              checked={level.isCompleted || isWalkAnimationTriggered} 
              onChange={handleSuccessCheckboxChange}
              disabled={level.isCompleted || isWalkAnimationTriggered}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-hacker-red bg-hacker-gray border-hacker-gray rounded focus:ring-hacker-red mr-1.5 sm:mr-2 cursor-pointer disabled:cursor-not-allowed"
              aria-labelledby={`success-label-${level.id}`}
            />
            <label 
                id={`success-label-${level.id}`}
                htmlFor={`success-${level.id}`} 
                className={`font-share-tech-mono text-hacker-white select-none text-[0.7rem] sm:text-xs md:text-sm ${(level.isCompleted || isWalkAnimationTriggered) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              LLM cleared level.
            </label>
          </div>
        )}

        {level.isCompleted && !allLevelsCompleted && !isLastLevel && (
          <StyledButton 
            onClick={onGoNextLevel} 
            className={`w-full pulse-animation text-[0.75rem] sm:text-xs md:text-sm`}
            aria-label={`Proceed to Level ${level.id + 1}`}
            >
            PROCEED TO LEVEL {level.id + 1}
          </StyledButton>
        )}
        
        {level.isCompleted && isLastLevel && !allLevelsCompleted && (
           <p className="text-center text-hacker-green font-share-tech-mono p-2 sm:p-3 text-xs sm:text-sm md:text-base">Final level completed! Checking overall status...</p>
        )}
      </div>
    </div>
  );
};