import React from 'react';

interface OnboardingProgressProps {
  progress: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ progress }) => {
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Getting Started</span>
        <span>{progress}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default OnboardingProgress;