import React from 'react';

interface SkipButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const SkipButton: React.FC<SkipButtonProps> = ({ 
  onClick, 
  disabled = false, 
  className = '' 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800
        border border-gray-300 rounded-md hover:bg-gray-50
        transition-colors duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      Skip
    </button>
  );
};