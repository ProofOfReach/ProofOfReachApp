import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { logger } from '@/lib/logger';

const OnboardingPage: NextPage = () => {
  const router = useRouter();
  const { authState, isLoading } = useAuthRefactored();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Destructure query parameters
  const { role, timestamp, forced, pubkey, error } = router.query;
  
  // Determine login state
  const isLoggedIn = authState?.isLoggedIn || false;
  
  // Check for stored onboarding flags in session/localStorage
  useEffect(() => {
    // Only run this once
    if (checkedStorage) return;
    
    try {
      if (typeof window !== 'undefined') {
        // Check session storage for forced onboarding redirection
        const hasPendingOnboarding = window.sessionStorage.getItem('pending_onboarding_redirect') === 'true';
        const savedPubkey = window.sessionStorage.getItem('onboarding_pubkey');
        const savedRole = window.sessionStorage.getItem('onboarding_role');
        
        // If we have pending onboarding data and we're not in an onboarding session already
        if (hasPendingOnboarding && savedPubkey && savedRole && !forced) {
          logger.debug('Detected pending onboarding redirect in session storage', { 
            pubkey: savedPubkey.substring(0, 8) + '...',
            role: savedRole
          });
          
          // Flag that we checked storage
          setCheckedStorage(true);
          
          // Redirect to onboarding with preserved parameters
          window.location.href = `/onboarding?timestamp=${Date.now()}&role=${savedRole}&forced=true`;
          return;
        }
        
        // Clear the flag to prevent loops if we're already on onboarding page with proper params
        if (forced === 'true') {
          window.sessionStorage.removeItem('pending_onboarding_redirect');
          logger.debug('Cleared pending onboarding redirect flag from storage');
        }
      }
    } catch (err) {
      // Ignore storage errors, not critical
      logger.warn('Error checking storage for onboarding flags', { 
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
    
    // Mark storage as checked
    setCheckedStorage(true);
  }, [checkedStorage, forced]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn && !isRedirecting) {
      setIsRedirecting(true);
      logger.info('Not authenticated, redirecting to login');
      
      // Store current URL with query params to restore after login
      const currentUrl = window.location.pathname + window.location.search;
      
      // Redirect to login with this page as the return destination
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [isLoggedIn, isLoading, router, isRedirecting]);
  
  // If still loading auth state or storage check, or not logged in, show loading
  if (isLoading || !isLoggedIn || !checkedStorage) {
    return (
      <Layout title="Loading Onboarding...">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout 
      title="Nostr Ads Onboarding"
      hideNavbar 
      fullWidth
      className="bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto py-8 px-4">
        <OnboardingProvider initialRole={role as string}>
          <OnboardingWizard />
        </OnboardingProvider>
      </div>
    </Layout>
  );
};

export default OnboardingPage;