import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { generateRegularAccount, storeRegularAccountKeys } from '../lib/nostr';

const TestAuthPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<any>({});

  // Check login status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check cookies
        const cookies = document.cookie.split(';').map(c => c.trim());
        const nostrPubkey = cookies.find(c => c.startsWith('nostr_pubkey='));
        const authToken = cookies.find(c => c.startsWith('auth_token='));
        
        // Check localStorage
        const storedPubkey = localStorage.getItem('nostr_real_pk');
        
        setAuthStatus({
          cookies: {
            nostrPubkey: nostrPubkey ? nostrPubkey.split('=')[1] : null,
            authToken: authToken ? 'Present' : null,
          },
          localStorage: {
            storedPubkey,
            // Show other relevant localStorage items
            currentRole: localStorage.getItem('userRole'),
            cachedRoles: localStorage.getItem('cachedAvailableRoles'),
          }
        });
        
        if (nostrPubkey) {
          setPubkey(nostrPubkey.split('=')[1]);
        } else if (storedPubkey) {
          setPubkey(storedPubkey);
        }
      } catch (err) {
        console.logger.error('Error checking auth status:', err);
      }
    };
    
    checkAuth();
  }, []);

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Clear any existing auth data
      localStorage.removeItem('nostr_real_pk');
      localStorage.removeItem('nostr_real_sk');
      localStorage.removeItem('nostr_test_pk');
      localStorage.removeItem('nostr_test_sk');
      document.cookie = 'nostr_pubkey=; path=/; max-age=0';
      document.cookie = 'auth_token=; path=/; max-age=0';
      
      // Generate a new account
      const { privateKey, publicKey } = generateRegularAccount();
      
      console.log('Generated new account pubkey:', publicKey);
      
      // Store the keys
      storeRegularAccountKeys(privateKey, publicKey);
      
      // Call our simplified test login endpoint
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey: publicKey }),
        credentials: 'include', // Important for cookies
      });
      
      const data = await response.json();
      setResult(data);
      
      if (response.ok) {
        // Check if the cookie was actually set
        setTimeout(() => {
          const cookies = document.cookie.split(';').map(c => c.trim());
          const nostrPubkey = cookies.find(c => c.startsWith('nostr_pubkey='));
          
          if (nostrPubkey) {
            console.log('Cookie was successfully set!');
            setPubkey(publicKey);
          } else {
            console.warn('Cookie was not set properly');
          }
          
          // Update auth status
          const checkAuth = async () => {
            const cookies = document.cookie.split(';').map(c => c.trim());
            const nostrPubkey = cookies.find(c => c.startsWith('nostr_pubkey='));
            const authToken = cookies.find(c => c.startsWith('auth_token='));
            
            setAuthStatus({
              cookies: {
                nostrPubkey: nostrPubkey ? nostrPubkey.split('=')[1] : null,
                authToken: authToken ? 'Present' : null,
              },
              localStorage: {
                storedPubkey: localStorage.getItem('nostr_real_pk'),
                currentRole: localStorage.getItem('userRole'),
                cachedRoles: localStorage.getItem('cachedAvailableRoles'),
              }
            });
          };
          
          checkAuth();
        }, 500);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err: any) {
      console.logger.error('Error creating account:', err);
      setError(err.message || 'Unknown error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!pubkey) {
        throw new Error('No pubkey available. Create an account first.');
      }
      
      const response = await fetch(`/api/onboarding/status?pubkey=${pubkey}&role=viewer`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      setResult({
        onboardingStatus: data,
        message: 'Onboarding status checked successfully',
      });
      
      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err: any) {
      console.logger.error('Error checking onboarding:', err);
      setError(err.message || 'Unknown error checking onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    try {
      // Clear all localStorage
      localStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.trim().split('=')[0] + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      });
      
      setAuthStatus({});
      setPubkey(null);
      setResult(null);
      setError(null);
      
      alert('All auth data cleared successfully');
      
      // Reload page
      window.location.reload();
    } catch (err: any) {
      console.logger.error('Error clearing data:', err);
      setError(err.message || 'Unknown error clearing data');
    }
  };

  return (
    <Layout title="Test Authentication">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(authStatus, null, 2)}
              </pre>
            </div>
            
            <div className="mt-6 space-y-4">
              <button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Create Test Account'}
              </button>
              
              <button
                onClick={handleTestOnboarding}
                disabled={isLoading || !pubkey}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
              >
                Test Onboarding Flow
              </button>
              
              <button
                onClick={clearAllData}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Clear All Auth Data
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {result && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Manual Navigation:</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                >
                  Go to Login Page
                </button>
                
                <button
                  onClick={() => router.push('/onboarding')}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                >
                  Go to Onboarding Page
                </button>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestAuthPage;