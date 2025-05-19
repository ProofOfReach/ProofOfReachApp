import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';

const OnboardingProgress: React.FC = () => {
  const { progress, currentStep, totalSteps, isFirstStep, isLastStep } = useOnboarding();
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Step {progress === 100 ? totalSteps : Math.ceil((progress / 100) * totalSteps)} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
          {progress}% Complete
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step labels - only show in larger screens */}
      <div className="hidden md:flex justify-between mt-2 px-1">
        {isFirstStep ? (
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Start</span>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">Start</span>
        )}
        
        {!isFirstStep && !isLastStep ? (
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">In Progress</span>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">In Progress</span>
        )}
        
        {isLastStep ? (
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Complete</span>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
        )}
      </div>
    </div>
  );
};

export default OnboardingProgress;