import React from 'react';

interface StyledTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const StyledTextArea: React.FC<StyledTextAreaProps> = ({ label, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs sm:text-sm font-medium text-hacker-gray mb-1 font-share-tech-mono">{label.toUpperCase()}</label>}
      <textarea
        {...props}
        className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-hacker-dark text-hacker-green border border-hacker-green rounded focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-hacker-red shadow-hacker-glow-green font-share-tech-mono resize-none"
        rows={props.rows || 4} // Default to 4 rows if not specified, adjust as needed
      />
    </div>
  );
};