import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { defaultUseRole } from '@/context/RoleContext';
import { UserRole } from '@/types/role';
import clientOnboardingService from '@/lib/clientOnboardingService';
import { logger } from '@/lib/logger';

// Create a safer initial value for SSR hydration
const defaultContextValue = {
  currentStep: 'role-selection' as OnboardingStep,
  progress: 0,
  totalSteps: 1,
  isFirstStep: true,
  isLastStep: false,
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  setSelectedRole: (_role: string) => {},
  selectedRole: null,
  completeOnboarding: async () => {},
  isLoading: false,
  skipOnboarding: async () => {}
};

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
  | 'create-api-key'
  | 'integration-details'
  | 'ad-slot-config'
  | 'setup-wallet'
  | 'enable-test-mode'
  | 'go-live'
  | 'setup-complete'
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
// Standard viewer steps for regular users
const standardViewerSteps: OnboardingStep[] = [
  'role-selection',
  'preferences',
  'discovery',
  'privacy', // Removed 'notifications' step as it's not relevant for viewers using external apps
  'feedback',
  'complete'
];

// Simplified viewer steps for Nostr extension users (just 2 steps)
// Important: this array must only have 3 steps for proper step counting:
// 1. role-selection (hidden in UI)
// 2. privacy (first visible step - shown as Step 1 of 2)
// 3. complete (second visible step - shown as Step 2 of 2)
const nostrViewerSteps: OnboardingStep[] = [
  'role-selection',
  'privacy',
  'complete'
];

// We'll determine which to use in getStepsForRole based on Nostr extension detection
const viewerSteps: OnboardingStep[] = standardViewerSteps;

const publisherSteps: OnboardingStep[] = [
  'role-selection',
  'choose-integration',
  'integration-details',
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
  setSelectedRole: (role: string) => void;
  selectedRole: string | null;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  skipOnboarding: () => Promise<void>;
};

// Using our default context value for better SSR compatibility
const OnboardingContext = createContext<OnboardingContextType>(defaultContextValue);

type OnboardingProviderProps = {
  children: ReactNode;
  forcePubkey?: string | null;
  initialRole?: string | null;
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children, forcePubkey, initialRole }) => {
  const auth = useAuth();
  const isLoggedIn = !!auth?.auth;
  const roleContext = defaultUseRole();
  // Safely access currentRole with a fallback to prevent hydration errors
  const currentRole = roleContext?.currentRole || 'viewer';
  const router = useRouter();
  
  // For SSR compatibility, use basic initial values
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize steps based on the current role or selected role
  // Import hasNostrExtension function to detect Nostr extension
  const checkForNostrExtension = () => {
    // Only run in browser environment
    if (typeof window === 'undefined') return false;
    return !!window?.nostr;
  };

  const getStepsForRole = (role: string | null): OnboardingStep[] => {
    switch (role) {
      case 'viewer':
        // Always use the standard flow to ensure role selection is shown
        // Only use simplified flow AFTER role has been confirmed as viewer
        logger.debug(`Using standard flow for viewer (hasNostrExtension: ${checkForNostrExtension()})`);
        return standardViewerSteps;
      case 'publisher':
        return publisherSteps;
      case 'advertiser':
        return advertiserSteps;
      default:
        return ['role-selection'] as OnboardingStep[];
    }
  };
  
  // Define these variables in a way that's safe for server-side rendering
  const roleSpecificSteps = getStepsForRole(selectedRole || currentRole);
  const currentStepIndex = Math.max(0, roleSpecificSteps.indexOf(currentStep));
  const totalSteps = roleSpecificSteps.length;
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  
  // Initialize onboarding state when the component mounts
  useEffect(() => {
    // Skip this logic on the server-side
    if (typeof window === 'undefined') {
      return;
    }
    
    // Detect potential redirect loops
    const urlParams = new URLSearchParams(window.location.search);
    const timestamp = urlParams.get('timestamp');
    const hasRedirectParams = !!timestamp;
    
    // If redirects are happening too frequently, break the loop
    if (hasRedirectParams) {
      const now = Date.now();
      const redirectTime = parseInt(timestamp || '0', 10);
      const timeSinceRedirect = now - redirectTime;
      
      // If multiple redirects within 2 seconds, this might be a loop
      if (timeSinceRedirect < 2000) {
        logger.warn('Potential redirect loop detected, halting further redirects');
        
        // Store this decision in session to prevent further redirect attempts
        window.sessionStorage.setItem('preventOnboardingRedirects', 'true');
        window.sessionStorage.setItem('lastRedirectTime', now.toString());
        return; // Exit early to break the loop
      }
    }

    // Check if redirects are disabled (only in browser)
    const preventRedirects = window.sessionStorage.getItem('preventOnboardingRedirects') === 'true';
    
    if (preventRedirects) {
      logger.info('Redirects temporarily disabled to prevent loops');
      return;
    }

    // Initialize onboarding in browser context only
    const initializeOnboarding = async () => {
      // If we have an initial role (from URL params), immediately skip to the first step for that role
      if (selectedRole && currentStep === 'role-selection') {
        const steps = getStepsForRole(selectedRole);
        setCurrentStep(steps[1]); // Skip to the first role-specific step
      }
      
      // If coming back to onboarding with a current role but no selected role yet, initialize with that role
      if (!selectedRole && currentRole && currentRole !== 'admin') {
        setSelectedRole(currentRole);
        
        // Check if onboarding was already in progress
        const pubkeyToUse = forcePubkey || auth?.auth?.pubkey;
        if (pubkeyToUse) {
          try {
            const status = await clientOnboardingService.getOnboardingStatus(pubkeyToUse, currentRole);
            const isComplete = status?.isComplete || false;
            
            if (isComplete && !forcePubkey && !preventRedirects) { // Don't redirect if forcePubkey is provided or if preventing redirects
              // Redirect to dashboard if onboarding is already complete
              const redirectUrl = `/dashboard`;
              
              // Add timestamp to track potential redirect loops
              const redirectWithParam = `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}timestamp=${Date.now()}`;
              router.push(redirectWithParam);
            }
          } catch (error) {
            logger.log('Error checking onboarding status:', { error });
          }
        }
      }
    };
    
    initializeOnboarding();
  }, [selectedRole, currentStep, currentRole, isLoggedIn, router, forcePubkey]);
  
  // Handle role selection
  const handleRoleSelection = (role: string) => {
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
  
  // Track and save progress when the current step changes - client-side only
  useEffect(() => {
    // Skip on server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
    const pubkeyToUse = forcePubkey || auth?.auth?.pubkey;
    if (pubkeyToUse && selectedRole && currentStep && !isFirstStep) {
      // Only save steps after the first step
      clientOnboardingService.updateOnboardingProgress(pubkeyToUse, selectedRole, {
        currentStep
      }).catch((error: any) => {
        logger.log('Error saving onboarding progress', { error, pubkey: pubkeyToUse, role: selectedRole });
      });
    }
  }, [currentStep, selectedRole, isLoggedIn, forcePubkey, isFirstStep]);

  // Mark onboarding as complete and redirect to the appropriate dashboard
  const completeOnboarding = async () => {
    const pubkeyToUse = forcePubkey || auth?.auth?.pubkey;
    if (pubkeyToUse && selectedRole) {
      setIsLoading(true);
      try {
        // Use client-side service to mark onboarding complete
        await clientOnboardingService.completeOnboarding(pubkeyToUse, selectedRole);
        // Redirect to dashboard
        router.push(`/dashboard?timestamp=${Date.now()}`);
      } catch (error) {
        logger.log('Error completing onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Skip onboarding and redirect to the appropriate dashboard
  const skipOnboarding = async () => {
    const pubkeyToUse = forcePubkey || auth?.auth?.pubkey;
    if (pubkeyToUse && (selectedRole || currentRole)) {
      setIsLoading(true);
      try {
        const role = selectedRole || currentRole;
        if (role) {
          // Use client-side service to mark onboarding complete
          await clientOnboardingService.completeOnboarding(pubkeyToUse, role as UserRole);
          // Redirect to dashboard
          router.push(`/dashboard?timestamp=${Date.now()}`);
        }
      } catch (error) {
        logger.log('Error skipping onboarding:', { error, pubkey: pubkeyToUse });
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