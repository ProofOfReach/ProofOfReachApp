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
  // Get values directly from the hook
  const onboarding = useOnboarding();
  
  // Calculate which step number we're on
  const stepNumber = typeof onboarding.currentStep === 'string'
    ? onboarding.progress // Use the numeric progress directly
    : customCurrentStep || 1;
  
  // Use custom props if provided, otherwise use context values
  const currentStep = customCurrentStep ?? stepNumber;
  const totalSteps = customTotalSteps ?? onboarding.totalSteps ?? 3; // Default to 3 steps
  
  // Calculate progress based on current step (not percentage)
  // Handle edge case of totalSteps === 1 to prevent NaN
  const calculatedProgress = customProgress ?? 
    (totalSteps <= 1 ? 100 : ((currentStep - 1) / (totalSteps - 1)) * 100);
  
  // Use client-side only rendering for the progress component to avoid hydration issues
  const [isClient, setIsClient] = React.useState(false);
  
  // Effect to update state when component mounts on client
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className={`mb-6 ${className}`} data-testid="onboarding-progress">
      <div className="flex justify-center items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      {/* Only render the Progress component client-side to avoid hydration mismatches */}
      {isClient ? (
        <Progress value={calculatedProgress} className="w-full" />
      ) : (
        // Server-side placeholder with the same basic structure 
        <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 w-full">
          <div 
            className="h-full w-full flex-1 bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300 ease-in-out"
            style={{ transform: `translateX(-${100 - calculatedProgress}%)` }}
          />
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;