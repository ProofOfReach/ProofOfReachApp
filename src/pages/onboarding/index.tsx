import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '@/types/role';
import '@/components/Layout';
import '@/hooks/useAuthRefactored';
import '@/lib/logger';
import '@/components/Loading';
import '@/hooks/useHydration';

/**
 * Role-Based Onboarding Page
 * 
 * This page handles the user onboarding experience with role-specific flows for:
 * - Viewers: Browse content and personalize preferences
 * - Publishers: Set up ad spaces and integration
 * - Advertisers: Create campaigns and set budgets
 * 
 * It uses a hydration-safe approach to ensure consistent rendering between
 * server and client.
 */
const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const { authState, isLoading: authLoading } = useAuthRefactored() as any;
  const [mounted, setMounted] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [initialRole, setInitialRole] = useState<UserRole | null>(null);
  
  // Use hydration hook to safely handle client-only rendering
  const isHydrated = useHydration();
  
  // Destructure query parameters
  const { role, timestamp, forced, pubkey, error } = router.query;
  
  // Determine login state - check if we have a pubkey in the auth state
  const isLoggedIn = !!authState?.isLoggedIn || !!authState?.pubkey || false;
  
  // Process the role from query parameters when they're available
  useEffect(() => {
    if (role && typeof role === 'string') {
      const normalizedRole = role.toLowerCase() as UserRole;
      if (['viewer', 'publisher', 'advertiser', 'admin'].includes(normalizedRole)) {
        setInitialRole(normalizedRole);
        logger.debug('Initialized onboarding with role from URL parameters', { role: normalizedRole });
      }
    }
  }, [role]);
  
  // Mark as mounted on the client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check for stored onboarding flags and detect redirect loops
  useEffect(() => {
    // Skip during SSR or before hydration is complete
    if (!isHydrated) return;
    
    // Only run this once
    if (checkedStorage) return;
    
    // Check for potential redirect loops if we have a timestamp parameter
    if (timestamp && typeof timestamp === 'string') {
      const now = Date.now();
      const paramTimestamp = parseInt(timestamp, 10);
      
      // If timestamps are too close together (within 2 seconds), this might be a loop
      if (now - paramTimestamp < 2000) {
        logger.warn('Potential redirect loop detected from URL parameters, breaking loop');
        
        window.sessionStorage.setItem('preventOnboardingRedirects', 'true');
        window.sessionStorage.setItem('lastRedirectTime', now.toString());
        setCheckedStorage(true);
        return;
      }
    }
    
    try {
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
          setInitialRole(savedRole as UserRole);
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
      }
      
      // Clear the flag to prevent loops if we're already on onboarding page with proper params
      if (forced === 'true') {
        window.sessionStorage.removeItem('pending_onboarding_redirect');
        logger.debug('Cleared pending onboarding redirect flag from storage');
      }
    } catch (err) {
      // Ignore storage errors, not critical
      logger.warn('Error checking storage for onboarding flags', { 
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
    
    // Mark storage as checked
    setCheckedStorage(true);
  }, [checkedStorage, forced, timestamp, isHydrated]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    // Skip during SSR or before hydration is complete
    if (!isHydrated) return;
    
    // Check for recent authentication attempt via localStorage markers we set during login
    const recentAuth = window.localStorage.getItem('auth_initiated') === 'true';
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
    if (!authLoading && !isLoggedIn && !isRedirecting && !isRecentAuthAttempt) {
      setIsRedirecting(true);
      logger.info('Not authenticated, redirecting to login');
      
      // Store current URL with query params to restore after login
      const currentUrl = window.location.pathname + window.location.search;
      
      // Redirect to login with this page as the return destination
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [isLoggedIn, authLoading, router, isRedirecting, isHydrated]);
  
  // Common loading state that will be the same on both server and client
  const loadingView = (
    <Layout title="Loading Onboarding...">
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    </Layout>
  );
  
  // Always render the loading state for server-side rendering
  // This ensures consistent markup between server and client
  if (!isHydrated) {
    return loadingView;
  }
  
  // Check for authentication transition markers
  const recentAuth = window.localStorage?.getItem('auth_initiated') === 'true';
  const authTimestamp = parseInt(window.localStorage?.getItem('auth_timestamp') || '0', 10);
  const authPubkey = window.localStorage?.getItem('auth_pubkey');
  const isRecentAuthAttempt = recentAuth && (Date.now() - authTimestamp < 10000) && authPubkey;
  
  // If still loading auth state or storage check, or not logged in AND not in a transition period, show loading
  if ((!mounted || authLoading || !isLoggedIn || !checkedStorage) && !isRecentAuthAttempt) {
    return loadingView;
  }
  
  // Extract the role from URL params if available
  const urlRole = typeof router.query.role === 'string' ? router.query.role as UserRole : null;
  
  // Dynamically import the client-side component
  // This is safe because we've already hydrated at this point
  const ClientOnboarding = require('@/components/onboarding/ClientOnboarding').default;
  
  return (
    <Layout title="Welcome to Proof Of Reach">
      <div className="container mx-auto p-4 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div data-testid="client-only">
          <ClientOnboarding />
        </div>
      </div>
    </Layout>
  );
};

export default OnboardingPage;