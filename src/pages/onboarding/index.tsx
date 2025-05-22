import React, { useState, useEffect, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { UserRoleType } from '@/types/role';
import Layout from '@/components/Layout';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import { logger } from '@/lib/logger';
import Loading from '@/components/Loading';

/**
 * Zero Server-Side Rendering Pattern for Browser Extension Integration
 * 
 * This pattern completely avoids hydration mismatches by rendering different content
 * on the server versus the client. It's specifically designed for components that:
 *  1. Interact with browser extensions (like Nostr)
 *  2. Use browser-specific APIs not available during SSR
 *  3. Need to prevent any hydration mismatches
 *
 * How it works:
 *  - On the server: Renders a minimal placeholder with no extension-dependent markup
 *  - On the client: Dynamically imports and renders the full interactive component
 *  - Uses React.lazy + Suspense to handle the async loading gracefully
 */

// Define a type that's compatible with both server and client components
type LazyComponentType = React.ComponentType<any>;

// Component that handles the clean client/server rendering separation
const ClientSideOnboarding = React.lazy<LazyComponentType>(() => {
  // Server-side case
  if (typeof window === 'undefined') {
    return Promise.resolve({
      // Return a minimal placeholder component that renders a single empty div
      // This ensures the server and client will never have structural differences
      default: function ServerPlaceholder() { 
        return React.createElement('div', { 
          'data-hydration-placeholder': true, 
          className: 'onboarding-placeholder' 
        }); 
      }
    });
  }
  
  // Client-side case: dynamically import the real interactive component
  return import('@/components/onboarding/ClientOnboarding');
});

/**
 * Completely simplified onboarding page that renders a placeholder on the server
 * and loads everything on the client side to avoid hydration issues
 */
const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const { authState, isLoading: authLoading } = useAuthRefactored();
  const [mounted, setMounted] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [initialRole, setInitialRole] = useState<UserRoleType | null>(null);
  
  // Destructure query parameters
  const { role, timestamp, forced, pubkey, error } = router.query;
  
  // Determine login state - check if we have a pubkey in the auth state
  const isLoggedIn = !!authState?.isLoggedIn || !!authState?.pubkey || false;
  
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
  
  // Check for stored onboarding flags and detect redirect loops
  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    
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
    } catch (err) {
      // Ignore storage errors, not critical
      logger.warn('Error checking storage for onboarding flags', { 
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
    
    // Mark storage as checked
    setCheckedStorage(true);
  }, [checkedStorage, forced, timestamp]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
  }, [isLoggedIn, authLoading, router, isRedirecting]);
  
  // Check for authentication transition markers
  const recentAuth = typeof window !== 'undefined' && window.localStorage?.getItem('auth_initiated') === 'true';
  const authTimestamp = typeof window !== 'undefined' ? parseInt(window.localStorage?.getItem('auth_timestamp') || '0', 10) : 0;
  const authPubkey = typeof window !== 'undefined' ? window.localStorage?.getItem('auth_pubkey') : null;
  const isRecentAuthAttempt = recentAuth && (Date.now() - authTimestamp < 10000) && authPubkey;
  
  // If still loading auth state or storage check, or not logged in AND not in a transition period, show loading
  if ((!mounted || authLoading || !isLoggedIn || !checkedStorage) && !isRecentAuthAttempt) {
    return (
      <Layout title="Loading Onboarding...">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }
  
  // Extract the role from URL params if available
  const urlRole = typeof router.query.role === 'string' ? router.query.role as UserRoleType : null;
  
  // Create a simple server-side rendered page with static content
  // The dynamic content will be loaded ONLY on the client-side
  return (
    <Layout title="Welcome to Proof Of Reach">
      <Head>
        <meta name="description" content="Complete your onboarding to get started with Proof Of Reach" />
      </Head>
      <div className="container mx-auto p-4 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Use Suspense to avoid hydration issues completely */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20" data-testid="server-fallback">
            <Loading size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading onboarding experience...
            </p>
          </div>
        }>
          {/* This is a pure client-side only component with zero SSR */}
          <div data-testid="client-only">
            <ClientSideOnboarding />
          </div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default OnboardingPage;