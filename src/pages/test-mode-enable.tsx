import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const TestModeEnablePage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState('/dashboard/viewer');

  useEffect(() => {
    if (router.query.redirect) {
      setDestination(router.query.redirect as string);
    }
    
    // Enable test mode
    try {
      if (typeof window !== 'undefined') {
        // Store test mode flag
        localStorage.setItem('isTestMode', 'true');
        
        // Set test mode expiry (24 hours from now)
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        sessionStorage.setItem('testModeExpiry', expiryTime.toString());
        
        // Create a mock pubkey for testing
        const testPubkey = 'npub_test_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('nostr:pubkey', testPubkey);
        
        // Set current role to viewer
        localStorage.setItem('nostr-ads:currentRole', 'viewer');
        
        // Add available roles
        localStorage.setItem('nostr-ads:availableRoles', JSON.stringify(['admin', 'advertiser', 'publisher', 'viewer']));
        
        console.log('Test mode enabled!');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(destination);
        }, 1500);
      }
    } catch (err) {
      console.logger.error('Error enabling test mode:', err);
      setError('Error enabling test mode. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [router, destination]);

  return (
    <>
      <Head>
        <title>Enabling Test Mode</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Test Mode
          </h1>
          
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Enabling test mode...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Return Home
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Test mode enabled! Redirecting to dashboard...</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div className="bg-blue-600 h-2.5 rounded-full animate-[grow_1.5s_ease-in-out]"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TestModeEnablePage;