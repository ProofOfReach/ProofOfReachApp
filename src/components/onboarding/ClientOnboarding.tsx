import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import OnboardingWizard from './OnboardingWizard';
import { OnboardingProvider } from '@/context/OnboardingContext';
import Loading from '@/components/Loading';
import { UserRoleType } from '@/types/role';
import { logger } from '@/lib/logger';
import { hasNostrExtension } from '@/lib/nostr';

/**
 * Pure Client-Side Onboarding Component
 * 
 * This component is designed to completely avoid SSR hydration issues by:
 * 1. Only rendering substantial content on the client side
 * 2. Safely detecting browser-specific features like Nostr extensions
 * 3. Providing a clear loading state during initialization
 * 
 * It pairs with the lazy-loading technique in the parent page to create
 * a seamless experience that never causes hydration mismatches.
 */
const ClientOnboarding: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [nostrDetected, setNostrDetected] = useState<boolean | null>(null);
  const router = useRouter();
  const { authState, isLoading: authLoading } = useAuthRefactored();
  
  // Extract and validate role from URL parameters
  const urlRole = typeof router.query.role === 'string' && 
    ['viewer', 'publisher', 'advertiser', 'admin'].includes(router.query.role.toLowerCase()) ? 
    (router.query.role.toLowerCase() as UserRoleType) : undefined;
  
  // Log initialization for debugging
  useEffect(() => {
    if (urlRole) {
      logger.debug('Initialized onboarding with role from URL parameters', { role: urlRole });
    }
  }, [urlRole]);
  
  // Check for Nostr extension once we're on the client
  useEffect(() => {
    // Safely detect the Nostr extension
    try {
      const extensionDetected = hasNostrExtension();
      setNostrDetected(extensionDetected);
      logger.debug('Nostr extension detection result', { detected: extensionDetected });
    } catch (error) {
      logger.error('Error detecting Nostr extension', { error });
      setNostrDetected(false);
    }

    // Set ready state after ensuring all client-side checks are complete
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
      hasNostrExtension={nostrDetected ?? false}
      data-testid="onboarding-provider"
    >
      <div data-testid="onboarding-wizard">
        <OnboardingWizard />
      </div>
    </OnboardingProvider>
  );
};

export default ClientOnboarding;