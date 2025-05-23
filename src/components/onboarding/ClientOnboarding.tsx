import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/hooks/useAuthRefactored';
import OnboardingWizard from './OnboardingWizard';
import '@/context/OnboardingContext';
import '@/components/Loading';
import '@/types/role';
import '@/lib/logger';

/**
 * Client-Side Onboarding Component
 * 
 * This component handles the onboarding flow with the following features:
 * 1. Client-side rendering for consistent user experience
 * 2. Role-based flow selection based on URL parameters or user selection
 * 3. Integration with our authentication system
 * 4. Proper state management for onboarding progress
 */
const ClientOnboarding: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { authState, isLoading: authLoading } = useAuthRefactored() as any;
  
  // Extract and validate role from URL parameters
  const urlRole = typeof router.query.role === 'string' && 
    ['viewer', 'publisher', 'advertiser', 'admin'].includes(router.query.role.toLowerCase()) ? 
    (router.query.role.toLowerCase() as UserRole) : undefined;
  
  // Log initialization for debugging
  useEffect(() => {
    if (urlRole) {
      logger.debug('Initialized onboarding with role from URL parameters', { role: urlRole });
    }
  }, [urlRole]);
  
  // Initialize client-side state and SDK integration
  useEffect(() => {
    // Set ready state after client-side initialization
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Display a loading indicator while client-side code initializes
  if (!isReady || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20" data-testid="onboarding-loading">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Loading onboarding experience...
        </p>
      </div>
    );
  }
  
  // Render the full onboarding experience with proper context
  return (
    <OnboardingProvider 
      forcePubkey={authState?.pubkey}
      initialRole={urlRole}
      data-testid="onboarding-provider"
    >
      <div data-testid="onboarding-wizard">
        <OnboardingWizard />
      </div>
    </OnboardingProvider>
  );
};

export default ClientOnboarding;