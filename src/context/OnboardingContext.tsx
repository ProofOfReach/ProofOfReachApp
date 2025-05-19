import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@prisma/client';
import { useRoleContext } from '@/context/RoleContext';
import onboardingService from '@/lib/onboardingService';

// Define the steps for each role's onboarding process
export type OnboardingStep = 
  // Viewer steps
  | 'preferences'
  | 'discovery'
  | 'notifications'
  | 'privacy'
  | 'feedback'
  // Publisher steps
  | 'choose-integration'
  | 'ad-slot-config'
  | 'setup-wallet'
  | 'enable-test-mode'
  | 'go-live'
  // Advertiser steps
  | 'create-campaign'
  | 'set-targeting'
  | 'budget-schedule'
  | 'fund-account'
  | 'dashboard-intro'
  // Shared steps
  | 'role-selection'
  | 'complete';

// Define role-specific step sequences
const viewerSteps: OnboardingStep[] = [
  'role-selection',
  'preferences',
  'discovery',
  'notifications',
  'privacy',
  'feedback',
  'complete'
];

const publisherSteps: OnboardingStep[] = [
  'role-selection',
  'choose-integration',
  'ad-slot-config',
  'setup-wallet',
  'enable-test-mode',
  'go-live',
  'complete'
];

const advertiserSteps: OnboardingStep[] = [
  'role-selection',
  'create-campaign',
  'set-targeting',
  'budget-schedule',
  'fund-account',
  'dashboard-intro',
  'complete'
];

type OnboardingContextType = {
  currentStep: OnboardingStep;
  progress: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setSelectedRole: (role: UserRole) => void;
  selectedRole: UserRole | null;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  skipOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

type OnboardingProviderProps = {
  children: ReactNode;
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { auth } = useAuth();
  const { currentRole } = useRoleContext();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize steps based on the current role or selected role
  const getStepsForRole = (role: UserRole | null): OnboardingStep[] => {
    switch (role) {
      case 'viewer':
        return viewerSteps;
      case 'publisher':
        return publisherSteps;
      case 'advertiser':
        return advertiserSteps;
      default:
        return ['role-selection'] as OnboardingStep[];
    }
  };
  
  const roleSpecificSteps = getStepsForRole(selectedRole || currentRole);
  const currentStepIndex = roleSpecificSteps.indexOf(currentStep);
  const totalSteps = roleSpecificSteps.length;
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  
  // Initialize onboarding state when the component mounts
  useEffect(() => {
    const initializeOnboarding = async () => {
      // Only set the role-specific step if we're past role selection
      if (selectedRole && currentStep === 'role-selection') {
        const steps = getStepsForRole(selectedRole);
        setCurrentStep(steps[1]); // Skip to the first role-specific step
      }
      
      // If coming back to onboarding with a current role, initialize with that role
      if (!selectedRole && currentRole && currentRole !== 'admin') {
        setSelectedRole(currentRole);
        
        // Check if onboarding was already in progress
        if (auth?.pubkey) {
          try {
            const isComplete = await onboardingService.isOnboardingComplete(auth.pubkey, currentRole);
            if (isComplete) {
              // Redirect to dashboard if onboarding is already complete
              const redirectUrl = await onboardingService.getPostLoginRedirectUrl(auth.pubkey, currentRole);
              router.push(redirectUrl);
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
          }
        }
      }
    };
    
    initializeOnboarding();
  }, [selectedRole, currentRole, auth, router]);
  
  // Handle role selection
  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    const steps = getStepsForRole(role);
    setCurrentStep(steps[1]); // Skip to the first step after role selection
  };
  
  // Navigate to the next step
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < roleSpecificSteps.length) {
      setCurrentStep(roleSpecificSteps[nextIndex]);
    }
  };
  
  // Navigate to the previous step
  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(roleSpecificSteps[prevIndex]);
    }
  };
  
  // Mark onboarding as complete and redirect to the appropriate dashboard
  const completeOnboarding = async () => {
    if (auth?.pubkey && selectedRole) {
      setIsLoading(true);
      try {
        await onboardingService.markOnboardingComplete(auth.pubkey, selectedRole);
        const redirectUrl = await onboardingService.getPostLoginRedirectUrl(auth.pubkey, selectedRole);
        router.push(redirectUrl);
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Skip onboarding and redirect to the appropriate dashboard
  const skipOnboarding = async () => {
    if (auth?.pubkey && (selectedRole || currentRole)) {
      setIsLoading(true);
      try {
        const role = selectedRole || currentRole;
        if (role) {
          await onboardingService.markOnboardingComplete(auth.pubkey, role);
          const redirectUrl = await onboardingService.getPostLoginRedirectUrl(auth.pubkey, role);
          router.push(redirectUrl);
        }
      } catch (error) {
        console.error('Error skipping onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const value = {
    currentStep,
    progress,
    totalSteps,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    setSelectedRole: handleRoleSelection,
    selectedRole,
    completeOnboarding,
    isLoading,
    skipOnboarding,
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};