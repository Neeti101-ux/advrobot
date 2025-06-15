import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`font-share-tech-mono text-[0.6rem] xxs:text-xs sm:text-sm md:text-base px-2 py-1 sm:px-3 md:px-4 sm:py-2 border-b-2 transition-all duration-300 ease-in-out whitespace-nowrap
                  ${isActive 
                    ? 'border-hacker-red text-hacker-red' 
                    : 'border-transparent text-hacker-gray hover:text-hacker-green hover:border-hacker-green'}`}
    >
      {label.toUpperCase()}
    </button>
  );
};