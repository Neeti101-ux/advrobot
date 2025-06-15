
import React from 'react';
import { BOT_TYPING_MESSAGE } from '../constants';

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = BOT_TYPING_MESSAGE, className = "" }) => {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <p className="text-hacker-green font-share-tech-mono text-lg animate-pulse">{text}</p>
    </div>
  );
};
