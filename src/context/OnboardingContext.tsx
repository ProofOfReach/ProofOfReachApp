import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useUnifiedAuth } from '@/providers/UnifiedAuthProvider';
import { UserRole } from '@/lib/supabase';
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
  // Common steps
  | 'role-selection'
  | 'authentication'
  // Publisher steps
  | 'integration-method'
  | 'setup-configuration'
  | 'api-key-testing'
  | 'complete-go-live'
  // Viewer steps
  | 'preferences'
  | 'discovery'
  | 'notifications'
  | 'privacy'
  | 'feedback'
  // Advertiser steps
  | 'create-campaign'
  | 'set-targeting'
  | 'budget-schedule'
  | 'fund-account'
  | 'dashboard-intro'
  | 'complete';

// Define role-specific step sequences
// Standard viewer steps for regular users (simplified to 3 steps)
const standardViewerSteps: OnboardingStep[] = [
  'role-selection',
  'discovery',
  'privacy',
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
  'integration-method',
  'setup-configuration',
  'api-key-testing',
  'complete-go-live'
];

// Streamlined 3-step advertiser flow for quick onboarding
const advertiserSteps: OnboardingStep[] = [
  'role-selection',
  'create-campaign',    // Business name + advertising goal
  'complete'           // Welcome to dashboard
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
  const auth = useUnifiedAuth();
  const isLoggedIn = auth?.isAuthenticated;
  const currentRole = auth?.role || 'viewer';
  const router = useRouter();
  
  // For SSR compatibility, use basic initial values
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    (initialRole && ['viewer', 'publisher', 'advertiser', 'admin', 'stakeholder'].includes(initialRole)) 
      ? initialRole as UserRole 
      : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize steps based on the current role or selected role
  const getStepsForRole = (role: string | null): OnboardingStep[] => {
    switch (role) {
      case 'viewer':
        // Always use the standard flow to ensure role selection is shown
        logger.debug(`Using standard flow for viewer`);
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
  // Only use currentRole if selectedRole is explicitly set, otherwise start with role selection
  const roleSpecificSteps = getStepsForRole(selectedRole);
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
      
      // Always start with role selection - never auto-assign roles to ensure explicit user choice
      // This follows best practices by not making assumptions about user intent
      if (!selectedRole) {
        // Ensure we're on the role selection step
        if (currentStep !== 'role-selection') {
          setCurrentStep('role-selection');
        }
        return; // Exit early to prevent automatic role assignment
      }
      
      // Only proceed with role-specific logic if a role was explicitly selected
      if (selectedRole && currentRole && currentRole !== 'admin') {
        
        // Check if onboarding was already in progress
        const pubkeyToUse = forcePubkey || auth?.user?.pubkey;
        if (pubkeyToUse && auth?.userProfile) {
          try {
            // Check if user already has a role set in their profile
            if (auth.userProfile.role !== 'viewer' && !forcePubkey && !preventRedirects) {
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
    if (['viewer', 'publisher', 'advertiser', 'admin', 'stakeholder'].includes(role)) {
      setSelectedRole(role as UserRole);
    }
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
    
    const pubkeyToUse = forcePubkey || auth?.user?.pubkey;
    if (pubkeyToUse && selectedRole && currentStep && !isFirstStep) {
      // Save progress in localStorage as a simple progress tracking method
      localStorage.setItem(`onboarding_progress_${pubkeyToUse}`, JSON.stringify({
        currentStep,
        selectedRole,
        timestamp: Date.now()
      }));
    }
  }, [currentStep, selectedRole, isLoggedIn, forcePubkey, isFirstStep]);

  // Mark onboarding as complete and redirect to the appropriate dashboard
  const completeOnboarding = async () => {
    if (!selectedRole) {
      logger.log('No role selected for onboarding completion');
      return;
    }
    
    setIsLoading(true);
    try {
      // Save the role to localStorage immediately for better UX
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentRole', selectedRole);
        localStorage.setItem('selectedRole', selectedRole);
        localStorage.setItem('onboardingComplete', 'true');
        
        // Dispatch a custom event to notify dashboard of role change
        window.dispatchEvent(new CustomEvent('roleSwitched', {
          detail: { from: 'viewer', to: selectedRole, timestamp: new Date().toISOString() }
        }));
      }

      // Save the role to the database using unified authentication
      // If not authenticated yet, the role will be saved when user connects Nostr
      if (auth.isAuthenticated && auth.user) {
        const success = await auth.updateUserRole(selectedRole as UserRole);
        
        if (success) {
          console.log('✅ Role successfully saved to database:', selectedRole);
        } else {
          console.log('⚠️ Database save failed, but continuing with localStorage role');
        }
      } else {
        console.log('ℹ️ User not authenticated yet, role will be saved when they connect Nostr');
        // Save intended role for when authentication happens
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingRole', selectedRole);
        }
      }
      
      // Always redirect to dashboard with the selected role
      router.push(`/dashboard?role=${selectedRole}&timestamp=${Date.now()}`);
    } catch (error) {
      logger.log('Error completing onboarding:', error as Record<string, any>);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Skip onboarding and redirect to the appropriate dashboard
  const skipOnboarding = async () => {
    const role = selectedRole || currentRole;
    if (role) {
      setIsLoading(true);
      try {
        // Save the role to the database using unified authentication
        const success = await auth.updateUserRole(role as UserRole);
        
        if (success) {
          // Redirect to dashboard
          router.push(`/dashboard?timestamp=${Date.now()}`);
        } else {
          logger.log('Failed to save role to database during skip');
        }
      } catch (error) {
        logger.log('Error skipping onboarding:', error as Record<string, any>);
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