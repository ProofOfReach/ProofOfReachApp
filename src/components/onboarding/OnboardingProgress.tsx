import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';

interface OnboardingProgressProps {
  // These props allow overriding values from the context
  customProgress?: number;
  customCurrentStep?: number;
  customTotalSteps?: number;
  className?: string;
}

/**
 * OnboardingProgress - Displays a progress bar for multi-step processes
 * 
 * This component can either get progress data from the OnboardingContext
 * or receive it directly through props, making it more flexible and reusable.
 */
const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  customProgress,
  customCurrentStep,
  customTotalSteps,
  className = '',
}) => {
  // Try to use the OnboardingContext, but don't crash if it's not available
  const contextValues = React.useContext(useOnboarding.context);
  
  // Use custom props if provided, otherwise use context values
  const progress = customProgress ?? contextValues?.progress ?? 0;
  const currentStep = customCurrentStep ?? contextValues?.currentStep ?? 1;
  const totalSteps = customTotalSteps ?? contextValues?.totalSteps ?? 3; // Default to 3 steps
  
  // Derive first/last step status
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  
  // Calculate the step number to display (capped at totalSteps)
  const displayStep = progress === 100 ? totalSteps : Math.min(Math.ceil((progress / 100) * totalSteps), totalSteps);
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Step {displayStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
          {progress}% Complete
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      
      {/* Step labels - only show in larger screens */}
      <div className="hidden md:flex justify-between mt-2 px-1">
        <span className={`text-xs ${isFirstStep ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
          Start
        </span>
        
        <span className={`text-xs ${!isFirstStep && !isLastStep ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
          In Progress
        </span>
        
        <span className={`text-xs ${isLastStep ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
          Complete
        </span>
      </div>
    </div>
  );
};

// Add the context to the component to let it work without crashing outside of provider
useOnboarding.context = React.createContext(undefined);

export default OnboardingProgress;