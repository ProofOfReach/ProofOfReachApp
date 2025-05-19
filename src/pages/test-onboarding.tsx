import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Layout from '@/components/Layout';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { getWithAuth } from '@/lib/api';
import { useRouter } from 'next/router';

/**
 * Test onboarding page that doesn't require authenticated context
 * This is used for testing the onboarding flow directly
 */
const TestOnboardingPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  
  // Force override localStorage keys to ensure the onboarding knows we're logged in
  useEffect(() => {
    if (pubkey) {
      try {
        localStorage.setItem('nostr_real_pk', pubkey);
        localStorage.setItem('cachedAuthState', JSON.stringify({
          isLoggedIn: true,
          pubkey,
          isTestMode: false,
          availableRoles: ['viewer'],
          currentRole: 'viewer'
        }));
      } catch (err) {
        console.error('Error setting localStorage:', err);
      }
    }
  }, [pubkey]);

  // Check auth and load onboarding data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get pubkey from cookie or localStorage
        const cookies = document.cookie.split(';').map(c => c.trim());
        const pubkeyCookie = cookies.find(c => c.startsWith('nostr_pubkey='));
        const extractedPubkey = pubkeyCookie ? pubkeyCookie.split('=')[1] : null;
        
        if (!extractedPubkey) {
          setError('No pubkey found in cookies. Please create a test account first.');
          setIsLoading(false);
          return;
        }
        
        setPubkey(extractedPubkey);
        
        // Get onboarding status
        try {
          const response = await getWithAuth(`/api/onboarding/status?pubkey=${extractedPubkey}&role=viewer`);
          const data = await response.json();
          setOnboardingData(data);
        } catch (apiError) {
          console.warn('Unable to fetch onboarding status. This is okay for testing.', apiError);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error checking auth status:', err);
        setError(err.message || 'Unknown error checking auth status');
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Layout title="Loading Test Onboarding...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-lg w-full">
            <h1 className="text-2xl font-bold mb-4">Loading Test Onboarding...</h1>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-3/4 mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-1/2 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Test Onboarding Error">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-lg w-full">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md mb-4">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={() => router.push('/test-auth')}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Back to Test Auth Page
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Test Onboarding"
      hideNavbar 
      fullWidth
      className="bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-4">Test Onboarding Mode</h1>
          <p className="mb-4">This is a test version of the onboarding flow that bypasses normal authentication.</p>
          
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <h2 className="font-semibold mb-2">Debug Information:</h2>
            <p><strong>Pubkey:</strong> {pubkey || 'None'}</p>
            <p><strong>Onboarding Status:</strong> {onboardingData ? 'Retrieved' : 'Not available'}</p>
          </div>
          
          <button
            onClick={() => router.push('/test-auth')}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md mr-2"
          >
            Back to Test Auth
          </button>
        </div>

        <OnboardingProvider forcePubkey={pubkey}>
          <OnboardingWizard />
        </OnboardingProvider>
      </div>
    </Layout>
  );
};

export default TestOnboardingPage;