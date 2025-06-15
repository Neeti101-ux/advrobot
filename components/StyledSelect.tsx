import React from 'react';

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label:string }[];
  label?: string;
}

export const StyledSelect: React.FC<StyledSelectProps> = ({ options, label, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs sm:text-sm font-medium text-hacker-gray mb-1 font-share-tech-mono">{label.toUpperCase()}</label>}
      <select
        {...props}
        className={`w-full p-2 sm:p-3 text-xs sm:text-sm bg-hacker-dark text-hacker-green border border-hacker-green rounded focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-hacker-red shadow-hacker-glow-green font-share-tech-mono appearance-none ${className || ''}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2317C3B2' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-hacker-dark text-hacker-green text-xs sm:text-sm">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};