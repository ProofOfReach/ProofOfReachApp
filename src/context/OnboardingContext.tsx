import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserRole } from '../types/auth';
import { useAuthRefactored } from '../hooks/useAuthRefactored';
import { logger } from '../lib/logger';

// Define the onboarding steps for each role
export type ViewerOnboardingStep =
  | 'select-interests'
  | 'connect-wallet'
  | 'privacy-settings'
  | 'first-ad-tutorial'
  | 'earnings-teaser'
  | 'complete';

export type PublisherOnboardingStep =
  | 'choose-integration'
  | 'ad-slot-config'
  | 'setup-wallet'
  | 'enable-test-mode'
  | 'go-live'
  | 'complete';

export type AdvertiserOnboardingStep =
  | 'create-campaign'
  | 'set-targeting'
  | 'budget-schedule'
  | 'fund-account'
  | 'dashboard-intro'
  | 'complete';

// Union type of all possible steps
export type OnboardingStep = 
  | ViewerOnboardingStep 
  | PublisherOnboardingStep 
  | AdvertiserOnboardingStep;

// Define the onboarding state for the context
interface OnboardingState {
  // Whether the user is currently in the onboarding flow
  isOnboarding: boolean;
  // The role being onboarded
  role: UserRole;
  // The current step in the onboarding process
  currentStep: OnboardingStep;
  // Progress (0-100) in the current onboarding flow
  progress: number;
  // Whether role selection/confirmation is complete
  isRoleConfirmed: boolean;
  // The list of steps for the current role
  steps: OnboardingStep[];
  // Whether onboarding was completed for this role
  completed: boolean;
  // Analytics data
  analyticsEvents: Array<{
    step: OnboardingStep;
    timestamp: number;
    completed: boolean;
  }>;
}

// Define the context API
interface OnboardingContextType extends OnboardingState {
  // Method to start the onboarding process for a role
  startOnboarding: (role: UserRole) => void;
  // Method to confirm the selected role
  confirmRole: (role: UserRole) => void;
  // Method to navigate to the next step
  nextStep: () => void;
  // Method to navigate to the previous step
  prevStep: () => void;
  // Method to go to a specific step
  goToStep: (step: OnboardingStep) => void;
  // Method to complete the onboarding process
  completeOnboarding: () => void;
  // Method to skip the onboarding process
  skipOnboarding: () => void;
  // Method to reset the onboarding progress
  resetOnboarding: () => void;
}

// Default steps for each role
const VIEW_STEPS: ViewerOnboardingStep[] = [
  'select-interests',
  'connect-wallet',
  'privacy-settings',
  'first-ad-tutorial',
  'earnings-teaser',
  'complete'
];

const PUBLISHER_STEPS: PublisherOnboardingStep[] = [
  'choose-integration',
  'ad-slot-config',
  'setup-wallet',
  'enable-test-mode',
  'go-live',
  'complete'
];

const ADVERTISER_STEPS: AdvertiserOnboardingStep[] = [
  'create-campaign',
  'set-targeting',
  'budget-schedule',
  'fund-account',
  'dashboard-intro',
  'complete'
];

// Create the context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  isOnboarding: false,
  role: 'viewer',
  currentStep: 'select-interests',
  progress: 0,
  isRoleConfirmed: false,
  steps: VIEW_STEPS,
  completed: false,
  analyticsEvents: [],
  startOnboarding: () => {},
  confirmRole: () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  completeOnboarding: () => {},
  skipOnboarding: () => {},
  resetOnboarding: () => {}
});

// Define the local storage key for persisting onboarding state
const STORAGE_KEY = 'nostr-ads-onboarding';

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const auth = useAuthRefactored();
  
  // Initialize state
  const [state, setState] = useState<Omit<OnboardingState, 'steps'>>({
    isOnboarding: false,
    role: 'viewer',
    currentStep: 'select-interests',
    progress: 0,
    isRoleConfirmed: false,
    completed: false,
    analyticsEvents: []
  });
  
  // Computed steps based on the role
  const steps = React.useMemo(() => {
    switch (state.role) {
      case 'viewer':
        return VIEW_STEPS;
      case 'publisher':
        return PUBLISHER_STEPS;
      case 'advertiser':
        return ADVERTISER_STEPS;
      default:
        return VIEW_STEPS;
    }
  }, [state.role]);
  
  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        setState(prevState => ({
          ...prevState,
          ...parsedState,
          // Only restore the following fields if they exist in stored state
          isOnboarding: parsedState.isOnboarding ?? prevState.isOnboarding,
          role: parsedState.role ?? prevState.role,
          currentStep: parsedState.currentStep ?? prevState.currentStep,
          progress: parsedState.progress ?? prevState.progress,
          isRoleConfirmed: parsedState.isRoleConfirmed ?? prevState.isRoleConfirmed,
          completed: parsedState.completed ?? prevState.completed,
          analyticsEvents: parsedState.analyticsEvents ?? prevState.analyticsEvents
        }));
      }
    } catch (error) {
      logger.error('Failed to load onboarding state from localStorage', error);
    }
  }, []);
  
  // Persist state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      logger.error('Failed to save onboarding state to localStorage', error);
    }
  }, [state]);
  
  // Calculate progress percentage based on current step
  useEffect(() => {
    const currentIndex = steps.indexOf(state.currentStep as any);
    const totalSteps = steps.length;
    const newProgress = Math.round((currentIndex / (totalSteps - 1)) * 100);
    
    setState(prevState => ({
      ...prevState,
      progress: newProgress
    }));
  }, [state.currentStep, steps]);
  
  // Check if the user's current role matches the onboarding role
  useEffect(() => {
    if (state.isOnboarding && state.isRoleConfirmed && auth.authState.currentRole !== state.role) {
      // If the user has switched roles, update their current role
      auth.updateUserRole(state.role).catch(error => {
        logger.error('Failed to update user role during onboarding', error);
      });
    }
  }, [state.isOnboarding, state.isRoleConfirmed, state.role, auth]);
  
  // Method to start the onboarding process
  const startOnboarding = (role: UserRole) => {
    let initialStep: OnboardingStep;
    
    switch (role) {
      case 'viewer':
        initialStep = 'select-interests';
        break;
      case 'publisher':
        initialStep = 'choose-integration';
        break;
      case 'advertiser':
        initialStep = 'create-campaign';
        break;
      default:
        initialStep = 'select-interests';
    }
    
    setState(prevState => ({
      ...prevState,
      isOnboarding: true,
      role,
      currentStep: initialStep,
      progress: 0,
      isRoleConfirmed: false,
      completed: false,
      analyticsEvents: [
        ...prevState.analyticsEvents,
        {
          step: initialStep,
          timestamp: Date.now(),
          completed: false
        }
      ]
    }));
  };
  
  // Method to confirm the selected role
  const confirmRole = (role: UserRole) => {
    setState(prevState => ({
      ...prevState,
      role,
      isRoleConfirmed: true,
      analyticsEvents: [
        ...prevState.analyticsEvents,
        {
          step: prevState.currentStep,
          timestamp: Date.now(),
          completed: true
        }
      ]
    }));
  };
  
  // Method to navigate to the next step
  const nextStep = () => {
    const currentIndex = steps.indexOf(state.currentStep as any);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex];
      
      setState(prevState => ({
        ...prevState,
        currentStep: nextStep,
        analyticsEvents: [
          ...prevState.analyticsEvents,
          {
            step: prevState.currentStep,
            timestamp: Date.now(),
            completed: true
          },
          {
            step: nextStep,
            timestamp: Date.now(),
            completed: false
          }
        ]
      }));
    }
  };
  
  // Method to navigate to the previous step
  const prevStep = () => {
    const currentIndex = steps.indexOf(state.currentStep as any);
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      const prevStep = steps[prevIndex];
      
      setState(prevState => ({
        ...prevState,
        currentStep: prevStep,
        analyticsEvents: [
          ...prevState.analyticsEvents,
          {
            step: prevStep,
            timestamp: Date.now(),
            completed: false
          }
        ]
      }));
    }
  };
  
  // Method to go to a specific step
  const goToStep = (step: OnboardingStep) => {
    if (steps.includes(step as any)) {
      setState(prevState => ({
        ...prevState,
        currentStep: step,
        analyticsEvents: [
          ...prevState.analyticsEvents,
          {
            step,
            timestamp: Date.now(),
            completed: false
          }
        ]
      }));
    }
  };
  
  // Method to complete the onboarding process
  const completeOnboarding = () => {
    setState(prevState => ({
      ...prevState,
      isOnboarding: false,
      completed: true,
      analyticsEvents: [
        ...prevState.analyticsEvents,
        {
          step: prevState.currentStep,
          timestamp: Date.now(),
          completed: true
        }
      ]
    }));
    
    // Redirect to the appropriate dashboard based on role
    switch (state.role) {
      case 'viewer':
        router.push('/dashboard/viewer');
        break;
      case 'publisher':
        router.push('/dashboard/publisher');
        break;
      case 'advertiser':
        router.push('/dashboard/advertiser');
        break;
      default:
        router.push('/dashboard');
    }
  };
  
  // Method to skip the onboarding process
  const skipOnboarding = () => {
    setState(prevState => ({
      ...prevState,
      isOnboarding: false,
      completed: false,
      analyticsEvents: [
        ...prevState.analyticsEvents,
        {
          step: prevState.currentStep,
          timestamp: Date.now(),
          completed: false
        }
      ]
    }));
    
    // Redirect to the appropriate dashboard based on role
    switch (state.role) {
      case 'viewer':
        router.push('/dashboard/viewer');
        break;
      case 'publisher':
        router.push('/dashboard/publisher');
        break;
      case 'advertiser':
        router.push('/dashboard/advertiser');
        break;
      default:
        router.push('/dashboard');
    }
  };
  
  // Method to reset the onboarding progress
  const resetOnboarding = () => {
    setState({
      isOnboarding: false,
      role: 'viewer',
      currentStep: 'select-interests',
      progress: 0,
      isRoleConfirmed: false,
      completed: false,
      analyticsEvents: []
    });
    
    // Clear from localStorage
    localStorage.removeItem(STORAGE_KEY);
  };
  
  // Provide the context value
  const contextValue: OnboardingContextType = {
    ...state,
    steps,
    startOnboarding,
    confirmRole,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
  
  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook for using the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
};