import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import OnboardingWizard from './OnboardingWizard';
import { OnboardingProvider } from '@/context/OnboardingContext';
import Loading from '@/components/Loading';
import { UserRoleType } from '@/types/role';

/**
 * Pure client-side onboarding component
 * This component completely loads on the client side to avoid hydration issues
 */
const ClientOnboarding: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { authState } = useAuthRefactored();
  
  // Get role from URL if available and convert to proper UserRoleType
  const urlRole = typeof router.query.role === 'string' && 
    ['viewer', 'publisher', 'advertiser', 'admin'].includes(router.query.role.toLowerCase()) ? 
    (router.query.role.toLowerCase() as UserRoleType) : undefined;
  
  // Set ready state after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading indicator until client-side code is fully ready
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Loading onboarding experience...
        </p>
      </div>
    );
  }
  
  // Render the full onboarding experience
  return (
    <OnboardingProvider forcePubkey={authState?.pubkey} initialRole={urlRole} data-testid="onboarding-provider">
      <div data-testid="onboarding-wizard">
        <OnboardingWizard />
      </div>
    </OnboardingProvider>
  );
};

export default ClientOnboarding;