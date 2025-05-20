import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Progress } from '@/components/ui/progress';

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
 * This component uses the shadcn UI Progress component and can either get 
 * progress data from the OnboardingContext or receive it directly through props.
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
  const currentStep = customCurrentStep ?? contextValues?.currentStep ?? 1;
  const totalSteps = customTotalSteps ?? contextValues?.totalSteps ?? 3; // Default to 3 steps
  
  // Derive first/last step status
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  
  // Calculate progress based on current step (not percentage)
  const calculatedProgress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-center items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      {/* Using the shadcn UI Progress component */}
      <Progress value={calculatedProgress} className="w-full" />
      
      {/* No step labels as per user request */}
    </div>
  );
};

// Add the context to the component to let it work without crashing outside of provider
useOnboarding.context = React.createContext(undefined);

export default OnboardingProgress;