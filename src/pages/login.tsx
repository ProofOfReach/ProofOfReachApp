import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../lib/logger';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { auth, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTestOptions, setShowTestOptions] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (auth?.isLoggedIn && auth?.pubkey) {
      router.push('/dashboard');
    }
  }, [auth, router]);

  const handleTestModeLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate test keys
      const testKeys = {
        publicKey: `pk_test_${Math.random().toString(36).substring(2, 14)}`,
        privateKey: `sk_test_${Math.random().toString(36).substring(2, 18)}`
      };
      
      // Store in localStorage
      localStorage.setItem('nostr_test_pk', testKeys.publicKey);
      localStorage.setItem('nostr_test_sk', testKeys.privateKey);
      
      // Login with test keys
      await login(testKeys.publicKey, 'test');
      
      logger.log('Test login successful', testKeys.publicKey);
      router.push('/dashboard');
      
    } catch (err) {
      logger.log('Test login failed', err);
      setError('Test login failed. Please try again.');
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

          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/api/auth/nostr'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Connect with Nostr Extension
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
              </div>
            </div>

            <div className="border border-blue-200 dark:border-blue-900 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Developer Test Mode
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                Test the application with simulated data and user roles.
              </p>
              
              <button
                onClick={handleTestModeLogin}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Starting Test Mode...' : 'Enter Test Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;