import { UserRole } from "@/types/role";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
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
import { logger } from '../lib/logger';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { auth, login } = useAuth();
  const isAuthenticated = auth?.isLoggedIn || false;
  const pubkey = auth?.pubkey || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [authStatus, setAuthStatus] = useState<{authenticated: boolean; pubkey?: string} | null>(null);
  const [testKeysGenerated, setTestKeysGenerated] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{publicKey: string; privateKey?: string} | null>(null);

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
        logger.log('Auto-login prevented due to flags:', { 
          preventAutoLogin, 
          clearCacheParam,
          forceLogoutParam
        });
        
        localStorage.removeItem('prevent_auto_login');
        return;
      }
      
      if (isAuthenticated && pubkey) {
        logger.log('Login page - Already authenticated, redirecting to dashboard with pubkey:', pubkey);
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, pubkey, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkExtension = () => {
        const extensionAvailable = hasNostrExtension();
        setHasExtension(extensionAvailable);
        
        if (!extensionAvailable) {
          logger.log('No Nostr extension detected');
        }
      };

      checkExtension();
      
      const timeout = setTimeout(checkExtension, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const handleNostrLogin = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!hasExtension) {
        throw new Error('No Nostr extension found. Please install a Nostr extension like Alby or nos2x.');
      }

      const pubkey = await getNostrPublicKey();
      if (!pubkey) {
        throw new Error('Failed to get public key from Nostr extension');
      }

      logger.log('Got pubkey from extension:', pubkey);

      await login(pubkey, 'nostr');

      setMessage('Login successful! Redirecting...');
      router.push('/dashboard');

    } catch (err: any) {
      logger.log('Nostr login error:', err);
      const errorMessage = err?.message || 'Failed to authenticate with Nostr extension';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      logger.log('Creating new regular account...');
      
      const keys = generateRegularAccount();
      if (!keys || !keys.publicKey) {
        throw new Error('Failed to generate account keys');
      }

      logger.log('Generated regular account keys:', keys.publicKey);
      
      storeRegularAccountKeys(keys.publicKey, keys.privateKey || '');
      
      await login(keys.publicKey, 'regular');
      
      setMessage('Account created successfully! Redirecting...');
      router.push('/dashboard');

    } catch (err: any) {
      logger.log('Account creation error:', err);
      const errorMessage = err?.message || 'Failed to create account';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTestMode = () => {
    setShowTestOptions(!showTestOptions);
    setTestKeysGenerated(false);
    setGeneratedKeys(null);
  };

  const handleTestModeLogin = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      logger.log('Starting test mode login...');
      
      const testKeys = generateTestKeyPair();
      if (!testKeys || !testKeys.publicKey) {
        throw new Error('Failed to generate test keys');
      }

      logger.log('Generated test keys:', testKeys.publicKey);
      
      setGeneratedKeys(testKeys);
      setTestKeysGenerated(true);
      
      storeTestKeys(testKeys.publicKey, testKeys.privateKey || '');
      
      // Enable test mode
      localStorage.setItem('testMode', 'true');
      
      await login(testKeys.publicKey, 'test');
      
      logger.log('Test login successful', testKeys.publicKey);
      setMessage('Test mode activated! Redirecting...');
      router.push('/dashboard');

    } catch (err: any) {
      logger.log('Test login failed', err);
      const errorMessage = err?.message || 'Test login failed';
      setError(errorMessage);
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          <div className="space-y-4">
            {/* Nostr Extension Login */}
            <button
              onClick={handleNostrLogin}
              disabled={isLoading || !hasExtension}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                hasExtension && !isLoading
                  ? 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Connecting...' : hasExtension ? 'Connect with Nostr Extension' : 'Install Nostr Extension First'}
            </button>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {hasExtension ? 'Connect using your Nostr extension (Alby, nos2x, etc.)' : 'Please install a Nostr extension like Alby or nos2x'}
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              onClick={handleCreateAccount}
              disabled={isLoading}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;