import React, { useEffect, useState } from 'react';
import "./context/OnboardingContext';
import "./components/ui/progress';
import "./types/role';
import "./context/OnboardingContext';
import "./lib/logger';

interface OnboardingProgressProps {
  // These props allow overriding values from the context
  customProgress?: number;
  customCurrentStep?: number;
  customTotalSteps?: number;
  className?: string;
  forceNostrMode?: boolean; // For testing and forcing Nostr mode
}

// Helper to detect Nostr extension
const checkForNostrExtension = (): boolean => {
  // Only run in browser environment
  if (typeof window === 'undefined') return false;
  return !!window?.nostr;
};

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
  forceNostrMode = false
}) => {
  // Get values directly from the hook
  const onboarding = useOnboarding();
  
  // Check for Nostr extension (client-side only)
  const [hasNostrExtension, setHasNostrExtension] = useState(false);
  
  // Effect to detect Nostr extension on client side
  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return;
    
    // Detect Nostr extension or use forced value
    const hasNostr = forceNostrMode || checkForNostrExtension();
    setHasNostrExtension(hasNostr);
    
    // Log detection result
    logger.debug(`OnboardingProgress - Nostr extension detected: ${hasNostr}`);
  }, [forceNostrMode]);
  
  // If custom steps are provided, use them
  let currentStep = 1;
  let totalSteps = customTotalSteps ?? 7; // Default to 7 steps
  
  // If in role selection, always step 1
  if (onboarding.currentStep === 'role-selection') {
    currentStep = 1;
    totalSteps = customTotalSteps ?? 7; // First step of the process
  } 
  // For advertiser role, use the proper step sequence (7 total steps)
  else if (onboarding.selectedRole === 'advertiser') {
    totalSteps = customTotalSteps ?? 7;
    // Map from step name to step number
    switch (onboarding.currentStep) {
      case 'create-campaign': currentStep = 2; break;
      case 'set-targeting': currentStep = 3; break;
      case 'budget-schedule': currentStep = 4; break;
      case 'fund-account': currentStep = 5; break;
      case 'dashboard-intro': currentStep = 6; break;
      case 'complete': currentStep = 7; break;
      default: currentStep = 1;
    }
  } 
  // For publisher role, use the proper step sequence (8 total steps)
  else if (onboarding.selectedRole === 'publisher') {
    totalSteps = customTotalSteps ?? 8;
    // Map from step name to step number
    switch (onboarding.currentStep) {
      case 'choose-integration': currentStep = 2; break;
      case 'integration-details': currentStep = 3; break;
      case 'ad-slot-config': currentStep = 4; break;
      case 'setup-wallet': currentStep = 5; break;
      case 'enable-test-mode': currentStep = 6; break;
      case 'go-live': currentStep = 7; break;
      case 'complete': currentStep = 8; break;
      default: currentStep = 1;
    }
  } 
  // For viewer role, handle Nostr vs standard flow
  else if (onboarding.selectedRole === 'viewer') {
    // Special case: For Nostr extension users with viewer role, use a 2-step flow
    if (hasNostrExtension) {
      // Nostr users with viewer role get a simplified 2-step flow
      totalSteps = customTotalSteps ?? 2;
      
      // Step mapping for Nostr users (simplified)
      switch (onboarding.currentStep) {
        case 'privacy': currentStep = 1; break; // First visible step
        case 'complete': currentStep = 2; break; // Second visible step
        default: currentStep = 1; // Default to first step
      }
      
      logger.debug(`OnboardingProgress - Using 2-step Nostr flow (${currentStep}/${totalSteps})`);
    } else {
      // Standard viewer flow (3 steps)
      totalSteps = customTotalSteps ?? 3;
      
      // Step mapping for standard viewers (3 steps)
      switch (onboarding.currentStep) {
        case 'discovery': currentStep = 1; break;
        case 'privacy': currentStep = 2; break;
        case 'complete': currentStep = 3; break;
        default: currentStep = 1;
      }
      
      logger.debug(`OnboardingProgress - Using 3-step standard flow (${currentStep}/${totalSteps})`);
    }
  }
  
  // If custom current step is provided, override the calculated value
  if (customCurrentStep) {
    currentStep = customCurrentStep;
  }
  
  // Calculate progress based on current step (not percentage)
  // Handle edge case of totalSteps === 1 to prevent NaN
  const calculatedProgress = customProgress ?? 
    (totalSteps <= 1 ? 100 : ((currentStep - 1) / (totalSteps - 1)) * 100);
  
  // Use client-side only rendering for the progress component to avoid hydration issues
  const [isClient, setIsClient] = useState(false);
  
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
        <div 
          className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 w-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={calculatedProgress}
        >
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