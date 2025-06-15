import React from 'react';
import { Jurisdiction } from '../../../types';
import { JURISDICTIONS_LIST } from '../../../constants';
import { StyledSelect } from '../../../components/StyledSelect';


interface JurisdictionSelectorProps {
  selectedJurisdiction: Jurisdiction;
  onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
}

export const JurisdictionSelector: React.FC<JurisdictionSelectorProps> = ({ selectedJurisdiction, onJurisdictionChange }) => {
  const options = JURISDICTIONS_LIST.map(j => ({ value: j.id, label: j.name }));
  
  return (
    <div className="w-full">
      <StyledSelect
        // label="Current Jurisdiction" // Label removed to save space in header
        options={options}
        value={selectedJurisdiction}
        onChange={(e) => onJurisdictionChange(e.target.value as Jurisdiction)}
        className="text-[0.7rem] sm:text-xs py-1.5 sm:py-2" // Smaller text for header usage
        aria-label="Select jurisdiction"
      />
    </div>
  );
};