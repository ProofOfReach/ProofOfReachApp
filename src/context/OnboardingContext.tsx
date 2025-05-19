import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import { UserRole } from '@/types/auth';
import OnboardingService from '@/lib/onboardingService';
import { logger } from '@/lib/logger';

// Onboarding steps for different roles
export type ViewerOnboardingStep = 'welcome' | 'role-info' | 'preferences' | 'complete';
export type PublisherOnboardingStep = 'choose-integration' | 'ad-slot-config' | 'setup-wallet' | 'enable-test-mode' | 'go-live' | 'complete';
export type AdvertiserOnboardingStep = 'create-campaign' | 'set-targeting' | 'budget-schedule' | 'fund-account' | 'dashboard-intro' | 'complete';

// Union type of all possible steps
export type OnboardingStep = ViewerOnboardingStep | PublisherOnboardingStep | AdvertiserOnboardingStep;

// Context interface
interface OnboardingContextType {
  currentStep: OnboardingStep;
  totalSteps: number;
  currentStepIndex: number;
  role: UserRole;
  isComplete: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

// Create context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  currentStep: 'welcome',
  totalSteps: 0,
  currentStepIndex: 0,
  role: 'viewer',
  isComplete: false,
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  goToStep: () => {},
  completeOnboarding: async () => {},
  resetOnboarding: async () => {}
});

// Define step sequences for each role
const viewerSteps: ViewerOnboardingStep[] = ['welcome', 'role-info', 'preferences', 'complete'];
const publisherSteps: PublisherOnboardingStep[] = ['choose-integration', 'ad-slot-config', 'setup-wallet', 'enable-test-mode', 'go-live', 'complete'];
const advertiserSteps: AdvertiserOnboardingStep[] = ['create-campaign', 'set-targeting', 'budget-schedule', 'fund-account', 'dashboard-intro', 'complete'];

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoggedIn, auth } = useAuthRefactored();
  const router = useRouter();
  const role = (auth?.currentRole as UserRole) || 'viewer';
  
  // State for tracking current step
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isComplete, setIsComplete] = useState(false);
  
  // Get the appropriate step sequence based on the user's role
  const stepSequence = (): OnboardingStep[] => {
    switch (role) {
      case 'viewer':
        return viewerSteps;
      case 'publisher':
        return publisherSteps;
      case 'advertiser':
        return advertiserSteps;
      default:
        return viewerSteps;
    }
  };
  
  // Get the current step index and total steps
  const currentStepIndex = stepSequence().indexOf(currentStep);
  const totalSteps = stepSequence().length;
  
  // Navigate to the next step
  const goToNextStep = () => {
    const sequence = stepSequence();
    const currentIndex = sequence.indexOf(currentStep);
    
    if (currentIndex < sequence.length - 1) {
      const nextStep = sequence[currentIndex + 1];
      setCurrentStep(nextStep);
    }
  };
  
  // Navigate to the previous step
  const goToPreviousStep = () => {
    const sequence = stepSequence();
    const currentIndex = sequence.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const prevStep = sequence[currentIndex - 1];
      setCurrentStep(prevStep);
    }
  };
  
  // Go to a specific step
  const goToStep = (step: OnboardingStep) => {
    if (stepSequence().includes(step)) {
      setCurrentStep(step);
    } else {
      logger.warn(`Invalid step for ${role} role: ${step}`);
    }
  };
  
  // Mark onboarding as complete
  const completeOnboarding = async () => {
    if (!isLoggedIn || !auth?.pubkey) {
      logger.error('Cannot complete onboarding: user not logged in');
      return;
    }
    
    try {
      await OnboardingService.markOnboardingComplete(auth.pubkey, role);
      setIsComplete(true);
      
      // Redirect to the appropriate dashboard
      let redirectPath = '/dashboard';
      
      switch (role) {
        case 'viewer':
          redirectPath = '/dashboard/viewer';
          break;
        case 'publisher':
          redirectPath = '/dashboard/publisher';
          break;
        case 'advertiser':
          redirectPath = '/dashboard/advertiser';
          break;
        case 'admin':
          redirectPath = '/dashboard/admin';
          break;
      }
      
      router.push(redirectPath);
    } catch (error) {
      logger.error('Error completing onboarding:', error);
    }
  };
  
  // Reset onboarding progress
  const resetOnboarding = async () => {
    if (!isLoggedIn || !auth?.pubkey) {
      logger.error('Cannot reset onboarding: user not logged in');
      return;
    }
    
    try {
      await OnboardingService.resetOnboardingStatus(auth.pubkey, role);
      
      // Reset to first step for the role
      const firstStep = stepSequence()[0];
      setCurrentStep(firstStep);
      setIsComplete(false);
    } catch (error) {
      logger.error('Error resetting onboarding:', error);
    }
  };
  
  // Initialize onboarding
  useEffect(() => {
    const initOnboarding = async () => {
      if (isLoggedIn && auth?.pubkey) {
        try {
          // Check if onboarding is already complete for this role
          const onboardingComplete = await OnboardingService.isOnboardingComplete(auth.pubkey, role);
          setIsComplete(onboardingComplete);
          
          // Set initial step to the first step in the sequence for the role
          const firstStep = stepSequence()[0];
          setCurrentStep(firstStep);
        } catch (error) {
          logger.error('Error initializing onboarding:', error);
        }
      }
    };
    
    initOnboarding();
  }, [isLoggedIn, auth?.pubkey, role]);
  
  // Provide the context value
  const contextValue: OnboardingContextType = {
    currentStep,
    totalSteps,
    currentStepIndex,
    role,
    isComplete,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeOnboarding,
    resetOnboarding
  };
  
  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
};

export default OnboardingContext;