import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthSwitch } from '../hooks/useAuthSwitch';
import { logger } from '../lib/logger';

/**
 * A new login page that uses the refactored authentication system.
 * This shows how to implement a login screen with the new auth hooks.
 */
export default function NewLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, isLoading } = useAuthSwitch();
  
  const [isAttemptingLogin, setIsAttemptingLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [testPubkey, setTestPubkey] = useState('pk_test_advertiser');
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/dashboard/advertiser-example');
    }
  }, [isAuthenticated, isLoading, router]);
  
  /**
   * Handle test mode login
   */
  const handleTestLogin = async () => {
    try {
      setIsAttemptingLogin(true);
      setErrorMessage('');
      
      if (!testPubkey.startsWith('pk_test_')) {
        setErrorMessage('For test mode, use a pubkey that starts with pk_test_');
        setIsAttemptingLogin(false);
        return;
      }
      
      // Create a signed message (for test mode, we just use a fixed string)
      // TypeScript workaround for string literal types
      const signedMessage: string = "test_signature";
      
      try {
        // The login method returns the auth state directly
        const authResult = await login(testPubkey, signedMessage as any);
        
        // Check if login was successful - first check the result, then check state
        if (authResult && (typeof authResult === 'object' && 'isLoggedIn' in authResult && authResult.isLoggedIn)) {
          router.push('/dashboard/advertiser-example');
        } else if (isAuthenticated) {
          router.push('/dashboard/advertiser-example');
        } else {
          // Re-check after a short delay to see if authentication state updated
          setTimeout(() => {
            if (isAuthenticated) {
              router.push('/dashboard/advertiser-example');
            } else {
              setErrorMessage('Login failed. Please try again.');
            }
          }, 500);
        }
      } catch (err) {
        logger.logger.error('Inner login error:', err);
        setErrorMessage('Login failed. Please try again.');
      }
    } catch (error) {
      logger.logger.error('Login error:', error);
      setErrorMessage(`Login error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsAttemptingLogin(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to Nostr Ad Marketplace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400">
            New Authentication System
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error message area */}
          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {errorMessage}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          {/* Test mode section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Test Mode
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="mb-4">
                <label htmlFor="testPubkey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Test Pubkey
                </label>
                <select
                  id="testPubkey"
                  value={testPubkey}
                  onChange={(e) => setTestPubkey(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                >
                  <option value="pk_test_advertiser">Test Advertiser</option>
                  <option value="pk_test_publisher">Test Publisher</option>
                  <option value="pk_test_admin">Test Admin</option>
                  <option value="pk_test_user">Test User (All Roles)</option>
                </select>
              </div>
              <button
                onClick={handleTestLogin}
                disabled={isAttemptingLogin}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isAttemptingLogin ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isAttemptingLogin ? 'Signing in...' : 'Sign in with Test Account'}
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Development Links
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/auth-refactored-test')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Auth Test Page
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}