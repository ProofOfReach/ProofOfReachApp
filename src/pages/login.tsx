import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuthSwitch } from '../hooks/useAuthSwitch';
import { 
  hasNostrExtension, 
  getNostrPublicKey, 
  generateTestKeyPair, 
  storeTestKeys, 
  getStoredTestKeys,
  generateRegularAccount,
  storeRegularAccountKeys
} from '../lib/nostr';
import { postWithAuth } from '../lib/api';
import { isPostForcedLogout } from '../lib/resetAuth';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, pubkey, login } = useAuthSwitch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Check if user already has Nostr extension
  useEffect(() => {
    const extensionAvailable = hasNostrExtension();
    console.log('Login page - Nostr extension status:', {
      hasExtension: extensionAvailable,
      windowNostr: typeof window !== 'undefined' ? Boolean(window.nostr) : false,
      windowNostrMethods: typeof window !== 'undefined' && window.nostr 
        ? Object.keys(window.nostr) 
        : 'No methods available'
    });
    
    setHasExtension(extensionAvailable);
    
    // Check if there are any localStorage keys that might be interfering with login
    if (typeof window !== 'undefined') {
      console.log('Login page - LocalStorage keys that might affect login:', {
        nostr_real_pk: Boolean(localStorage.getItem('nostr_real_pk')),
        nostr_test_pk: Boolean(localStorage.getItem('nostr_test_pk')),
        isTestMode: localStorage.getItem('isTestMode'),
        prevent_auto_login: localStorage.getItem('prevent_auto_login'),
        bypass_api_calls: localStorage.getItem('bypass_api_calls')
      });
    }
  }, []);

  // Check for forced logout flags in URL
  useEffect(() => {
    if (isPostForcedLogout()) {
      console.log('Detected forced logout - preventing auto-login');
      // Set a success message for user feedback
      setMessage('You have been successfully logged out.');
      return;
    }
    
    // Check URL parameters for messages - safely access router.query
    if (router.query && typeof router.query === 'object') {
      if (router.query.force_logout === 'true') {
        setMessage('You have been successfully logged out.');
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
      
      console.log('Login page - Authentication status check:', {
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
        console.log('Auto-login prevented due to flags:', { 
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
        console.log('Login page - Already authenticated, redirecting to dashboard with pubkey:', pubkey);
        router.push('/dashboard');
      } else {
        console.log('Login page - Not authenticated yet or missing pubkey');
      }
    }
  }, [isAuthenticated, pubkey, router]);

  const handleNip07Login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, clear any localStorage keys that might interfere with Nostr extension login
      if (typeof window !== 'undefined') {
        console.log('Clearing any localStorage keys that might interfere with Nostr extension login');
        localStorage.removeItem('nostr_real_pk');
        localStorage.removeItem('nostr_real_sk');
        localStorage.removeItem('nostr_test_pk');
        localStorage.removeItem('nostr_test_sk');
      }
      
      // Log the Nostr extension detection status before attempting to get the public key
      console.log('Nostr extension detection before login: ', {
        hasExtension: hasNostrExtension()
      });
      
      const pubkey = await getNostrPublicKey();
      
      if (!pubkey) {
        console.warn('getNostrPublicKey returned null or empty value');
        throw new Error('Could not get public key from Nostr extension');
      }
      
      console.log('Successfully retrieved pubkey: ', pubkey);

      // Send the pubkey to our backend to create/authenticate user
      console.log('Sending login request to API with pubkey', pubkey);
      const response = await postWithAuth('/api/auth/login', { 
        pubkey, 
        isTest: false 
      });

      let data;
      try {
        data = await response.json();
        console.log('API login response:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        const errorMessage = data && typeof data === 'object' && 'message' in data 
          ? data.message 
          : (data && typeof data === 'object' && 'error' in data 
              ? data.error 
              : 'Authentication failed');
        
        console.error('API login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // Double-check that we've cleared any fallback keys
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nostr_real_pk');
        localStorage.removeItem('nostr_real_sk');
        localStorage.removeItem('nostr_test_pk');
        localStorage.removeItem('nostr_test_sk');
      }

      // Use the login function from auth context with isTestMode=false
      console.log('Calling login function with pubkey', pubkey);
      await login(pubkey, false);

      // Redirect to dashboard
      console.log('Login successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login with Nostr extension');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, remove any potentially conflicting localStorage items
      console.log('Clearing any existing auth-related localStorage keys before creating account');
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
      
      console.log('Generated new regular account:', {
        publicKey,
        npub,
        // DO NOT log the private key in production!
        privateKeyFirstChars: privateKey.substring(0, 4) + '...'
      });
      
      // Store the keys in localStorage and set up as regular user
      storeRegularAccountKeys(privateKey, publicKey);
      
      console.log('Starting regular account login flow with', publicKey);
      
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
          console.error('Error parsing API response:', jsonError);
        }
        
        if (!response.ok) {
          const errorMessage = data && typeof data === 'object' && 'message' in data 
            ? data.message 
            : (data && typeof data === 'object' && 'error' in data 
                ? data.error 
                : 'Failed to register new account');
          
          throw new Error(errorMessage);
        }
        
        // Use the login function from auth context with isTestMode=false
        console.log('Calling login function for the new account');
        await login(publicKey, false);
        
        // Redirect immediately to dashboard without showing credentials
        console.log('Account created successfully, redirecting to dashboard');
        router.push('/dashboard');
      } catch (apiError: any) {
        console.error('API error during account creation:', apiError);
        
        // Even if API call fails, we've already set cookies and localStorage
        // We can still redirect to dashboard immediately
        console.log('Continuing to dashboard despite API error');
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Create account error:', err);
      setError(err.message || 'Failed to create new account');
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
      storeTestKeys(privateKey, publicKey);

      console.log('Starting test mode login flow with', publicKey);
      
      // Set test mode cookie directly in case the login function fails
      document.cookie = `nostr_pubkey=${publicKey}; path=/; max-age=86400`;
      document.cookie = `auth_token=test_token_${publicKey}; path=/; max-age=86400`;
      
      // Set a flag to preemptively skip the fetch in authService
      localStorage.setItem('isTestMode', 'true');
      localStorage.setItem('bypass_api_calls', 'true');
      
      // Set roles directly in localStorage
      const ALL_ROLES = ['advertiser', 'publisher', 'admin', 'stakeholder'];
      localStorage.setItem('cachedAvailableRoles', JSON.stringify(ALL_ROLES));
      localStorage.setItem('roleCacheTimestamp', Date.now().toString());
      localStorage.setItem('userRole', 'advertiser'); // Default role
      
      // Enable each role explicitly
      localStorage.setItem('isAdvertiser', 'true');
      localStorage.setItem('isPublisher', 'true');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isStakeholder', 'true');
      
      try {
        // Explicitly pass true for test mode
        const result = await login(publicKey, true);
        console.log('Test login successful:', result);
        
        // Use a small delay to ensure state is updated before navigation
        setTimeout(() => {
          // Force a direct window redirect instead of using the router
          // This is more reliable for test mode login
          window.location.href = '/dashboard';
        }, 200);
      } catch (loginError) {
        console.error('Test login internal error:', loginError);
        
        // Even if login call fails, we've already set cookies and localStorage
        // We can still redirect to dashboard
        console.log('Continuing to dashboard anyway since cookies were set directly');
        
        // Use a small delay to ensure state is updated before navigation
        setTimeout(() => {
          // Force a direct window redirect for more reliability
          window.location.href = '/dashboard';
        }, 200);
      }
    } catch (err: any) {
      console.error('Test mode login error:', err);
      setError(err.message || 'Failed to create test account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Login - Nostr Ad Marketplace">
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Login to Nostr Ad Marketplace
          </h1>

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

          <div className="space-y-4">
            <button
              onClick={handleNip07Login}
              disabled={isLoading || !hasExtension}
              className={`w-full btn-primary py-3 ${
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

export default LoginPage;
