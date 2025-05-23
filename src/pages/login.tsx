import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuthSwitch } from '../hooks/useAuthSwitch';
import { 
  nostr, 
  hasNostrExtension, 
  getNostrPublicKey, 
  generateTestKeyPair, 
  getStoredTestKeys, 
  storeTestKeys,
  generateRegularAccount,
  storeRegularAccountKeys
} from '../lib/nostr';
import { postWithAuth } from '../lib/api';
import { isPostForcedLogout } from '../lib/resetAuth';
import '@/lib/logger';
import '@/services/enhancedStorageService';

// Create a client-side only wrapper component to avoid hydration issues
import dynamic from 'next/dynamic';

const LoginPage: React.FC = () => {
  // Use a placeholder during server-side rendering
  return (
    <Layout title="Login - Nostr Ad Marketplace">
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Login to Nostr Ad Marketplace
          </h1>
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Client-side only component - all interactive login functionality goes here
const LoginPageClient: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, pubkey, login } = useAuthSwitch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [authStatus, setAuthStatus] = useState<{authenticated: boolean; pubkey?: string} | null>(null);
  const [testKeysGenerated, setTestKeysGenerated] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{publicKey: string; privateKey?: string} | null>(null);

  // Check if user already has Nostr extension and test mode status
  useEffect(() => {
    const extensionAvailable = hasNostrExtension();
    logger.log('Login page - Nostr extension status:', {
      hasExtension: extensionAvailable,
      windowNostr: typeof window !== 'undefined' ? Boolean(window.nostr) : false,
      windowNostrMethods: typeof window !== 'undefined' && window.nostr 
        ? Object.keys(window.nostr) 
        : 'No methods available'
    });
    
    setHasExtension(extensionAvailable);
    
    // Check if there are any localStorage keys that might be interfering with login
    if (typeof window !== 'undefined') {
      logger.log('Login page - LocalStorage keys that might affect login:', {
        nostr_real_pk: Boolean(localStorage.getItem('nostr_real_pk')),
        nostr_test_pk: Boolean(localStorage.getItem('nostr_test_pk')),
        isTestMode: localStorage.getItem('isTestMode'),
        prevent_auto_login: localStorage.getItem('prevent_auto_login'),
        bypass_api_calls: localStorage.getItem('bypass_api_calls')
      });
      
      // Check if there are any stored test keys
      const storedTestKeys = getStoredTestKeys();
      if (storedTestKeys && storedTestKeys.publicKey) {
        setTestKeysGenerated(true);
        setGeneratedKeys(storedTestKeys);
      }
      
      // Check if test mode was previously enabled via localStorage
      const isTestModeEnabled = enhancedStorage.getItem('showTestOptions') === 'true';
      if (isTestModeEnabled) {
        setShowTestOptions(true);
        
        // If we have test mode enabled but no keys, generate them
        if (!storedTestKeys || !storedTestKeys.publicKey) {
          const newKeys = generateTestKeyPair();
          if (newKeys) {
            setGeneratedKeys(newKeys);
            setTestKeysGenerated(true);
            logger.debug('Generated new test keys because previous keys were missing');
          }
        }
      }
    }
  }, []);
  
  // Toggle test mode on/off
  const toggleTestMode = () => {
    const newValue = !showTestOptions;
    setShowTestOptions(newValue);
    
    // Save preference to localStorage
    enhancedStorage.setItem('showTestOptions', newValue.toString());
    
    // If turning on test mode and no keys generated yet, generate them
    if (newValue && !testKeysGenerated) {
      const keys = generateTestKeyPair();
      if (keys) {
        setGeneratedKeys(keys);
        setTestKeysGenerated(true);
        logger.debug('Generated test keys when enabling test mode');
      }
    }
  };

  // Check for forced logout flags in URL
  useEffect(() => {
    if (isPostForcedLogout()) {
      console.log('Detected forced logout - preventing auto-login');
      // Set a log message for user feedback
      setMessage('You have been logfully logged out.');
      return;
    }
    
    // Check URL parameters for messages - safely access router.query
    if (router.query && typeof router.query === 'object') {
      if (router.query.force_logout === 'true') {
        setMessage('You have been logfully logged out.');
      } else if (router.query.clear_cache === 'true') {
        setMessage('Your session has been cleared.');
      }
    }
  }, [router.query]);

  // If already authenticated, redirect to dashboard 
  // unless prevent_auto_login flag is set
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for any logout indicators
      const preventAutoLogin = localStorage.getItem('prevent_auto_login') === 'true';
      const clearCacheParam = router.query && router.query.clear_cache === 'true';
      const forceLogoutParam = router.query && router.query.force_logout === 'true';
      
      logger.log('Login page - Authentication status check:', {
        isAuthenticated,
        pubkey,
        preventAutoLogin,
        clearCacheParam,
        forceLogoutParam,
        cookies: document.cookie.split(';').map(c => c.trim()).filter(c => c.startsWith('nostr_')),
        authRelatedCookies: document.cookie.split(';').map(c => c.trim()).filter(c => c.startsWith('auth_'))
      });
      
      if (preventAutoLogin || clearCacheParam || forceLogoutParam) {
        // Log this for debugging
        logger.log('Auto-login prevented due to flags:', { 
          preventAutoLogin, 
          clearCacheParam,
          forceLogoutParam
        });
        
        // Clear the flag after we've used it
        localStorage.removeItem('prevent_auto_login');
        
        // Don't redirect
        return;
      }
      
      // Normal authentication redirect
      if (isAuthenticated && pubkey) {
        logger.log('Login page - Already authenticated, redirecting to dashboard with pubkey:', pubkey);
        router.push('/dashboard');
      } else {
        logger.log('Login page - Not authenticated yet or missing pubkey');
      }
    }
  }, [isAuthenticated, pubkey, router]);

  const handleNip07Login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Clean up any potentially conflicting localStorage and cookies
      if (typeof window !== 'undefined') {
        logger.info('Clearing storage items that might interfere with Nostr extension login');
        
        // Clear localStorage items in a more robust way
        const itemsToClear = [
          'nostr_real_pk', 
          'nostr_real_sk', 
          'nostr_test_pk', 
          'nostr_test_sk', 
          'isTestMode',
          'bypass_api_calls',
          'current_auth_state',
          'authPubkey'
        ];
        
        itemsToClear.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            logger.warn(`Failed to clear ${key} from localStorage`, e);
          }
        });
        
        // Clear cookies in a more structured way
        const cookiesToClear = [
          'nostr_pubkey',
          'auth_token',
          'nostr_auth_session'
        ];
        
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        });
        
        logger.debug('Storage cleared for clean login attempt');
      }
      
      // First, check if we're in a browser
      if (typeof window === 'undefined') {
        throw new Error('Cannot access browser environment');
      }
      
      // Check for extension availability with detailed logging
      const extensionAvailable = hasNostrExtension();
      logger.info('Nostr extension status check:', { 
        available: extensionAvailable,
        windowNostr: Boolean(window.nostr),
        methods: window.nostr ? Object.keys(window.nostr) : 'none'
      });
      
      if (!extensionAvailable || !window.nostr) {
        throw new Error('Nostr extension not found. Please install a Nostr extension like nos2x or Alby.');
      }
      
      // Add an intentional delay to allow browser extension to fully initialize
      logger.debug('Waiting for Nostr extension initialization...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify extension is still available after delay
      if (!window.nostr || !window.nostr.getUserPublicKey) {
        throw new Error('Nostr extension API not available. Please refresh the page and try again.');
      }
      
      // Request public key with improved error handling
      let pubkey: string;
      try {
        logger.debug('Requesting public key from Nostr extension...');
        
        // Set up timeout for extension response
        const timeoutDuration = 5000; // 5 seconds
        const publicKeyPromise = window.nostr.getUserPublicKey();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout after ${timeoutDuration}ms waiting for Nostr extension`)), timeoutDuration);
        });
        
        // Add type assertion for proper TypeScript handling
        const retrievedPubkey = await Promise.race([publicKeyPromise, timeoutPromise]) as string;
        
        if (!retrievedPubkey || typeof retrievedPubkey !== 'string' || retrievedPubkey.length < 10) {
          throw new Error('Invalid public key received from Nostr extension');
        }
        
        pubkey = retrievedPubkey;
        logger.info('Successfully retrieved pubkey:', { pubkey: pubkey.substring(0, 8) + '...' });
      } catch (extensionError: unknown) {
        const errorDetails = extensionError instanceof Error 
          ? extensionError.message 
          : String(extensionError);
          
        logger.log('Failed to get public key from Nostr extension:', { error: errorDetails });
        
        if (errorDetails.includes('denied') || errorDetails.includes('rejected')) {
          throw new Error('Permission denied by user or Nostr extension. Please approve the request and try again.');
        } else if (errorDetails.includes('timeout')) {
          throw new Error('Nostr extension did not respond in time. Please check if it\'s working properly and try again.');
        } else {
          throw new Error(`Error connecting to Nostr extension: ${errorDetails}`);
        }
      }
      
      try {
        // Log the API request attempt
        logger.info('Sending login request to API with pubkey:', pubkey.substring(0, 8) + '...');
        
        // Send login request to API with better error handling
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest' // Help prevent CSRF
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({ 
            pubkey,
            isTest: false,
            timestamp: Date.now() // Add timestamp for request uniqueness
          })
        });
        
        // Define a proper interface for the API response
        interface LoginApiResponse {
          token?: string;
          pubkey?: string;
          message?: string;
          error?: string;
          redirectUrl?: string;
          log?: boolean;
          roles?: string[];
          userId?: string;
        }
        
        // Handle potential JSON parsing errors
        let data: LoginApiResponse;
        try {
          data = await response.json();
          logger.debug('API login response:', data);
        } catch (jsonError) {
          logger.log('Failed to parse API response:', jsonError);
          throw new Error('Received invalid response from server');
        }
        
        if (!response.ok) {
          const errorMessage = data.message || data.log || `Authentication failed with status ${response.status}`;
          logger.log('API login failed:', { status: response.status, error: errorMessage });
          throw new Error(errorMessage);
        }
        
        // Set auth state with cookies and localStorage for redundancy
        logger.debug('Setting authentication state after logful login');
        
        // Set cookies directly to ensure they're available immediately
        document.cookie = `nostr_pubkey=${pubkey}; path=/; max-age=86400; SameSite=Lax`;
        
        // Set authentication state directly in the auth context
        await login(pubkey, false);
        
        // Check onboarding status and redirect appropriately
        logger.debug('Determining redirect destination...');
        const onboardingService = await import('@/lib/onboardingService').then(mod => mod.default);
        // No default role - let the onboarding process handle role selection
        const redirectUrl = await onboardingService.getPostLoginRedirectUrl(pubkey);
        
        // Force a refresh of the app state before redirecting
        window.localStorage.setItem('auth_timestamp', Date.now().toString());
        
        // Set session storage flag to ensure onboarding redirection works reliably
        try {
          window.sessionStorage.setItem('pending_onboarding_redirect', 'true');
          window.sessionStorage.setItem('onboarding_pubkey', pubkey);
          // Don't pre-assign a role - let onboarding handle role selection
          window.sessionStorage.setItem('onboarding_timestamp', Date.now().toString());
          logger.debug('Set onboarding redirect flags in session storage');
        } catch (storageError) {
          logger.warn('Failed to set session storage for onboarding redirect', {
            error: storageError instanceof Error ? storageError.message : 'Unknown error'
          });
        }
        
        // Add a short delay to ensure state is fully updated before redirect
        logger.info(`Login logful, redirecting to ${redirectUrl}`);
        
        // Add authentication state marker explicitly to prevent immediate redirect back to login
        window.localStorage.setItem('auth_initiated', 'true');
        window.localStorage.setItem('auth_pubkey', pubkey);
        window.localStorage.setItem('auth_timestamp', Date.now().toString());
        
        // Add a small delay to ensure cookies are fully set before redirect
        setTimeout(() => {
          // Use window.location.href for a hard redirect instead of Next.js router
          // This ensures a fresh page load with the updated authentication state
          logger.debug(`Redirecting to ${redirectUrl} after auth state setup`);
          window.location.href = redirectUrl;
        }, 200);
      } catch (apiError: unknown) {
        const errorDetails = apiError instanceof Error ? apiError.message : String(apiError);
        logger.log('API authentication failed:', { error: errorDetails });
        throw new Error(`Failed to authenticate with the server: ${errorDetails}`);
      }
    } catch (err: unknown) {
      // Handle and display user-friendly error message
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred during login';
        
      logger.log('Login process failed:', { 
        error: errorMessage, 
        details: err instanceof Error ? err.stack : String(err)
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, remove any potentially conflicting localStorage items
      logger.log('Clearing any existing auth-related localStorage keys before creating account');
      localStorage.removeItem('nostr_real_pk');
      localStorage.removeItem('nostr_real_sk');
      localStorage.removeItem('nostr_test_pk');
      localStorage.removeItem('nostr_test_sk');
      localStorage.removeItem('isTestMode');
      localStorage.removeItem('bypass_api_calls');
      
      // Clear cookies that might interfere
      document.cookie = 'nostr_pubkey=; path=/; max-age=0';
      document.cookie = 'auth_token=; path=/; max-age=0';
      document.cookie = 'auth_session=; path=/; max-age=0';
      
      // Generate a regular account keypair
      const { privateKey, publicKey, npub, nsec } = generateRegularAccount();
      
      logger.log('Generated new regular account:', {
        publicKey,
        npub,
        // DO NOT log the private key in production!
        privateKeyFirstChars: privateKey ? privateKey.substring(0, 4) + '...' : 'undefined'
      });
      
      // Store the keys in localStorage and set up as regular user
      if (!privateKey) {
        throw new Error('Failed to generate private key');
      }
      storeRegularAccountKeys(privateKey, publicKey || '');
      
      logger.log('Starting regular account login flow with', publicKey);
      
      // Call the API to register the new user
      try {
        const response = await postWithAuth('/api/auth/login', { 
          pubkey: publicKey, 
          isTest: false 
        });
        
        let data;
        try {
          data = await response.json();
          console.log('API login response:', data);
        } catch (jsonError) {
          console.log('Error parsing API response:', jsonError);
        }
        
        if (!response.ok) {
          const errorMessage = data && typeof data === 'object' && 'message' in data 
            ? data.message 
            : (data && typeof data === 'object' && 'error' in data 
                ? data.log 
                : 'Failed to register new account');
          
          throw new Error(errorMessage);
        }
        
        // Use the login function from auth context with isTestMode=false
        logger.log('Calling login function for the new account');
        await login(publicKey as UserRole, false);
        
        // Determine where to redirect based on onboarding status
        logger.log('Account created logfully, checking onboarding status');
        const onboardingService = await import('@/lib/onboardingService').then(mod => mod.default);
        // No default role - let the onboarding process handle role selection
        const redirectUrl = await onboardingService.getPostLoginRedirectUrl(publicKey as string);
        
        logger.log(`Redirecting to ${redirectUrl}`);
        // Use window.location for a hard redirect to ensure state is refreshed
        window.location.href = redirectUrl;
      } catch (apiError: unknown) {
        logger.log('API error during account creation:', apiError instanceof Error ? apiError.message : String(apiError));
        
        // Even if API call fails, we've already set cookies and localStorage
        // We can still redirect to onboarding or dashboard
        logger.log('API call failed but continuing with redirection');
        try {
          const onboardingService = await import('@/lib/onboardingService').then(mod => mod.default);
          // No default role - let the onboarding process handle role selection
          const redirectUrl = await onboardingService.getPostLoginRedirectUrl(publicKey || '');
          
          logger.log(`Redirecting to ${redirectUrl} despite API error`);
          // Use window.location for a hard redirect to ensure state is refreshed
          window.location.href = redirectUrl;
        } catch (redirectError: unknown) {
          logger.log('Error during redirection:', redirectError instanceof Error ? redirectError.message : String(redirectError));
          // Fallback to dashboard if onboarding redirect fails
          window.location.href = '/dashboard';
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create new account';
      logger.log('Create account error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestModeLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a test key pair - will create keys with matching random ID
      const { privateKey, publicKey } = generateTestKeyPair();

      // Store the test keys and set all the necessary localStorage items for test mode
      storeTestKeys(privateKey || '', publicKey || '');

      logger.log('Starting test mode login flow with', publicKey || '');
      
      // Set test mode cookie directly in case the login function fails
      // Handle the publicKey with proper type checking
      const pubkeyValue = publicKey || '';
      document.cookie = `nostr_pubkey=${pubkeyValue}; path=/; max-age=86400`;
      document.cookie = `auth_token=test_token_${pubkeyValue}; path=/; max-age=86400`;
      
      // Set a flag to preemptively skip the fetch in authService
      localStorage.setItem('isTestMode', 'true');
      localStorage.setItem('bypass_api_calls', 'true');
      
      // Define role constants for consistency and type safety
      type UserRole = 'advertiser' | 'publisher' | 'admin' | 'stakeholder' | 'viewer';
      
      const ROLE_ADVERTISER: string = 'advertiser';
      const ROLE_PUBLISHER: string = 'publisher';
      const ROLE_ADMIN: string = 'admin';
      const ROLE_STAKEHOLDER: string = 'stakeholder';
      
      // Set roles directly in localStorage with typed array
      const ALL_ROLES: string[] = [ROLE_ADVERTISER, ROLE_PUBLISHER, ROLE_ADMIN, ROLE_STAKEHOLDER];
      localStorage.setItem('cachedAvailableRoles', JSON.stringify(ALL_ROLES));
      localStorage.setItem('roleCacheTimestamp', Date.now().toString());
      localStorage.setItem('userRole', ROLE_ADVERTISER); // Default role
      
      // Enable each role explicitly
      localStorage.setItem('isAdvertiser', 'true');
      localStorage.setItem('isPublisher', 'true');
      localStorage.setItem('true', 'true');
      localStorage.setItem('isStakeholder', 'true');
      
      try {
        // Explicitly pass true for test mode
        const result = await login(publicKey as UserRole, true);
        logger.log('Test login logful:', result);
      } catch (loginError: unknown) {
        logger.log('Test login internal error:', loginError instanceof Error ? loginError.message : String(loginError));
        logger.log('Continuing anyway since cookies were set directly');
      }

      // Complete onboarding for test users (regardless of login log)
      try {
        // Import onboarding service dynamically
        const onboardingService = await import('@/lib/onboardingService').then(mod => mod.default);
        
        // Define proper interface for API request and responses
        interface OnboardingCompleteRequest {
          pubkey: string;
          role: string;
          autoTest: boolean;
        }
        
        interface OnboardingCompleteResponse {
          log: boolean;
          message?: string;
          error?: string;
        }
        
        // Mark onboarding as complete for each role
        const testRoles: string[] = [
          ROLE_ADVERTISER, 
          ROLE_PUBLISHER, 
          ROLE_ADMIN, 
          'viewer' as UserRole
        ];
        
        for (const role of testRoles) {
          try {
            // Call the API to mark onboarding complete
            const response = await fetch('/api/onboarding/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pubkey: publicKey,
                role: role,
                autoTest: true
              } as OnboardingCompleteRequest)
            });
            
            if (response.ok) {
              logger.log(`Marked onboarding as complete for role: ${role}`);
            } else {
              // Parse response to get error details
              const errorData: OnboardingCompleteResponse = await response.json().catch(() => ({ log: false }));
              logger.warn(`Failed to mark onboarding complete for role: ${role}`, errorData?.log || 'Unknown error');
            }
          } catch (roleError: unknown) {
            logger.log(`Error marking onboarding complete for role ${role}:`, roleError instanceof Error ? roleError.message : String(roleError));
          }
        }
      } catch (onboardingError: unknown) {
        logger.log('Error setting up test user onboarding:', onboardingError instanceof Error ? onboardingError.message : String(onboardingError));
      }

      // Redirect to the dashboard after a short delay
      logger.log('Test Mode: Redirecting to dashboard');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (err: unknown) {
      logger.log('Test mode login error:', err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : 'Failed to create test account');
    } finally {
      setIsLoading(false);
    }
  };

  // We need to add client-side only rendering to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle prerendering (server-side) vs client-side rendering
  return (
    <Layout title="Login - Nostr Ad Marketplace">
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Login to Nostr Ad Marketplace
          </h1>

          {/* Only render dynamic content when mounted (client-side) */}
          {isMounted ? (
            <>
              {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </>
          ) : (
            // Static placeholder when server rendering to prevent hydration mismatch
            <div className="mb-4 h-[60px]"></div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleNip07Login}
              disabled={isLoading || !hasExtension}
              className={`w-full py-3 text-center px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1765cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] ${
                (!hasExtension || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Connecting...' : 'Login with Nostr Extension'}
            </button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateAccount}
              disabled={isLoading}
              className={`w-full py-3 text-center px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create New Account'}
            </button>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Creates a new Nostr account with default user role
            </p>
            
            {/* Test Mode Section */}
            <div className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Developer Test Mode
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={showTestOptions}
                    onChange={toggleTestMode}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {showTestOptions && (
                <div className="border border-blue-200 dark:border-blue-900 rounded-lg p-3 bg-blue-50 dark:bg-blue-900/30">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Test mode allows you to explore the application with simulated data and user roles.
                  </p>
                  
                  {testKeysGenerated && generatedKeys && generatedKeys.privateKey && (
                    <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto">
                      <p>Public Key: <span className="text-green-600 dark:text-green-400">{generatedKeys.publicKey.substring(0, 10)}...{generatedKeys.publicKey.substring(generatedKeys.publicKey.length - 5)}</span></p>
                      <p>Private Key: <span className="text-red-600 dark:text-red-400">{generatedKeys.privateKey.substring(0, 10)}...{generatedKeys.privateKey.substring(generatedKeys.privateKey.length - 5)}</span></p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleTestModeLogin}
                    disabled={isLoading}
                    className={`w-full py-2 text-center px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1765cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Starting Test Mode...' : 'Enter Test Mode'}
                  </button>
                  <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">
                    Creates a temporary test account with all user roles
                  </p>
                </div>
              )}
            </div>

            {!hasExtension && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                No Nostr extension detected. Install{' '}
                <a
                  href="https://getalby.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Alby
                </a>{' '}
                or{' '}
                <a
                  href="https://github.com/fiatjaf/nos2x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  nos2x
                </a>{' '}
                browser extensions, or use Test Mode below.
              </p>
            )}

            {/* Developer note section */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Developer Information
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                For development and testing purposes, use your authorized Nostr key to log in with proper permissions.
                Admin users can enable test mode from the Dashboard's Role Management section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Use dynamic import with { ssr: false } to create client-only component with improved hydration
const ClientLoginPage = dynamic(() => Promise.resolve(LoginPageClient), {
  ssr: false, // This prevents server-side rendering entirely
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  ),
});

// Define a new component that uses the client component within our SSR layout
const LoginPageContainer: React.FC = () => {
  return (
    <Layout title="Login - Nostr Ad Marketplace">
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800">
          {/* Heading is moved inside the ClientLoginPage component to avoid duplication */}
          <ClientLoginPage />
        </div>
      </div>
    </Layout>
  );
};

// Export the container component instead of the placeholder
export default LoginPageContainer;
