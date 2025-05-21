import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import { OnboardingProvider } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { logger } from '@/lib/logger';
import { UserRoleType } from '@/types/role';

// Import OnboardingWizard dynamically with SSR disabled to avoid hydration errors
const OnboardingWizard = dynamic(
  () => import('@/components/onboarding/OnboardingWizard'),
  { ssr: false, loading: () => <Loading className="py-10" /> }
);

const OnboardingPage: NextPage = () => {
  const router = useRouter();
  const { authState, isLoading } = useAuthRefactored();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [initialRole, setInitialRole] = useState<UserRoleType | null>(null);
  
  // Destructure query parameters
  const { role, timestamp, forced, pubkey, error } = router.query;
  
  // Determine login state
  const isLoggedIn = authState?.isLoggedIn || false;
  
  // Process the role from query parameters when they're available
  useEffect(() => {
    if (role && typeof role === 'string') {
      const normalizedRole = role.toLowerCase() as UserRoleType;
      if (['viewer', 'publisher', 'advertiser', 'admin'].includes(normalizedRole)) {
        setInitialRole(normalizedRole);
        logger.debug('Initialized onboarding with role from URL parameters', { role: normalizedRole });
      }
    }
  }, [role]);
  
  // Check for stored onboarding flags in session/localStorage
  useEffect(() => {
    // Only run this once
    if (checkedStorage) return;
    
    // Check for potential redirect loops if we have a timestamp parameter
    if (timestamp && typeof timestamp === 'string') {
      const now = Date.now();
      const paramTimestamp = parseInt(timestamp, 10);
      
      // If timestamps are too close together (within 2 seconds), this might be a loop
      if (now - paramTimestamp < 2000) {
        logger.warn('Potential redirect loop detected from URL parameters, breaking loop');
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('preventOnboardingRedirects', 'true');
          window.sessionStorage.setItem('lastRedirectTime', now.toString());
          setCheckedStorage(true);
          return;
        }
      }
    }
    
    try {
      if (typeof window !== 'undefined') {
        // Check if redirects are temporarily disabled to prevent loops
        const preventRedirects = window.sessionStorage.getItem('preventOnboardingRedirects') === 'true';
        if (preventRedirects) {
          logger.info('Redirects temporarily disabled to prevent loops');
          setCheckedStorage(true);
          return;
        }
        
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
          
          // Set the role from session storage
          if (savedRole && ['viewer', 'publisher', 'advertiser', 'admin'].includes(savedRole)) {
            setInitialRole(savedRole as UserRoleType);
          }
          
          // Flag that we checked storage
          setCheckedStorage(true);
          
          // Check for potential redirect loops by tracking redirects
          const lastRedirectTime = parseInt(window.sessionStorage.getItem('lastRedirectTime') || '0', 10);
          const now = Date.now();
          const timeSinceLastRedirect = now - lastRedirectTime;
          
          // If redirects are happening too quickly (within 2 seconds), may be a loop
          if (lastRedirectTime > 0 && timeSinceLastRedirect < 2000) {
            logger.warn('Potential redirect loop detected, halting further redirects');
            window.sessionStorage.setItem('preventOnboardingRedirects', 'true');
            return;
          }
          
          // Store this redirect timestamp
          window.sessionStorage.setItem('lastRedirectTime', now.toString());
          
          // Check if redirects are temporarily disabled
          const preventRedirects = window.sessionStorage.getItem('preventOnboardingRedirects') === 'true';
          if (preventRedirects) {
            logger.info('Redirects temporarily disabled to prevent loops');
            return;
          }
          
          // Redirect to onboarding with preserved parameters
          window.location.href = `/onboarding?timestamp=${now}&role=${savedRole}&forced=true`;
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
    // Check for recent authentication attempt via localStorage markers we set during login
    const recentAuth = typeof window !== 'undefined' && window.localStorage.getItem('auth_initiated') === 'true';
    const authTimestamp = parseInt(window.localStorage.getItem('auth_timestamp') || '0', 10);
    const authPubkey = window.localStorage.getItem('auth_pubkey');
    
    // Check if auth was initiated within the last 10 seconds (reasonable grace period)
    const isRecentAuthAttempt = recentAuth && (Date.now() - authTimestamp < 10000) && authPubkey;
    
    // If we're in the middle of a login-to-onboarding transition, don't redirect back to login
    if (isRecentAuthAttempt) {
      logger.info('Recent auth attempt detected, allowing onboarding to proceed');
      return;
    }
    
    // Normal authentication check - only redirect if not in transition period
    if (!isLoading && !isLoggedIn && !isRedirecting && !isRecentAuthAttempt) {
      setIsRedirecting(true);
      logger.info('Not authenticated, redirecting to login');
      
      // Store current URL with query params to restore after login
      const currentUrl = window.location.pathname + window.location.search;
      
      // Redirect to login with this page as the return destination
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [isLoggedIn, isLoading, router, isRedirecting]);
  
  // Check for authentication transition markers (from our modification above)
  const recentAuth = typeof window !== 'undefined' && window.localStorage?.getItem('auth_initiated') === 'true';
  const authTimestamp = typeof window !== 'undefined' ? parseInt(window.localStorage?.getItem('auth_timestamp') || '0', 10) : 0;
  const authPubkey = typeof window !== 'undefined' ? window.localStorage?.getItem('auth_pubkey') : null;
  const isRecentAuthAttempt = recentAuth && (Date.now() - authTimestamp < 10000) && authPubkey;
  
  // If still loading auth state or storage check, or not logged in AND not in a transition period, show loading
  if ((isLoading || !isLoggedIn || !checkedStorage) && !isRecentAuthAttempt) {
    logger.debug('Still loading onboarding', {
      isLoading,
      isLoggedIn,
      checkedStorage,
      isRecentAuthAttempt,
      recentAuth,
      authTimestamp: new Date(authTimestamp).toISOString()
    });
    
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
        <OnboardingProvider initialRole={initialRole}>
          <OnboardingWizard />
        </OnboardingProvider>
      </div>
    </Layout>
  );
};

export default OnboardingPage;