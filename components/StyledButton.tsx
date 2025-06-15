import React from 'react';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const StyledButton: React.FC<StyledButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-share-tech-mono rounded transition-all duration-300 ease-in-out focus:outline-none";
  const primaryStyle = "bg-hacker-red text-hacker-white hover:bg-opacity-80 shadow-hacker-glow-red";
  const secondaryStyle = "bg-hacker-green text-hacker-dark hover:bg-opacity-80 shadow-hacker-glow-green";

  const combinedClassName = `${baseStyle} ${variant === 'primary' ? primaryStyle : secondaryStyle} ${className || ''}`;

  return (
    <button {...props} className={combinedClassName}>
      {children}
    </button>
  );
};