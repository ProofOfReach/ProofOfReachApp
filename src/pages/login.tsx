import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import * as nostrLib from '../lib/nostr';
import { useUnifiedAuth } from '../providers/UnifiedAuthProvider';

// Create a clean, compact login component
const LoginPageClient: React.FC = () => {
  const router = useRouter();
  const { signInWithNostr, loading } = useUnifiedAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const handleNostrLogin = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Check if user has Nostr extension
      if (!nostrLib.hasNostrExtension()) {
        setError('Please install a Nostr browser extension to continue.');
        return;
      }

      // Get public key from Nostr extension
      const pubkey = await nostrLib.getNostrPublicKey();
      if (!pubkey) {
        setError('Failed to get public key from Nostr extension.');
        return;
      }

      // Use unified auth provider for sign in
      const success = await signInWithNostr(pubkey, 'viewer');
      if (success) {
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Generate fresh Nostr key pair for new account
      const { privateKey, publicKey } = nostrLib.generateTestKeyPair();
      
      // Store the keys securely for this new account
      nostrLib.storeTestKeys(privateKey, publicKey);
      
      // Use unified auth provider for sign in with new account
      const success = await signInWithNostr(publicKey, 'viewer');
      if (success) {
        setMessage('New account created! Redirecting to onboarding...');
        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
      } else {
        setError('Failed to create new account. Please try again.');
      }
    } catch (err) {
      setError('Failed to create new account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMode = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Generate test key pair
      const { privateKey, publicKey } = nostrLib.generateTestKeyPair();
      
      // Store test keys
      nostrLib.storeTestKeys(privateKey, publicKey);
      
      // Use unified auth provider for test mode sign in
      const success = await signInWithNostr(publicKey, 'viewer');
      if (success) {
        setMessage('Test mode activated! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError('Failed to activate test mode. Please try again.');
      }
      
      // Enable test mode
      nostrLib.enableTestMode();

      // Send login request with test pubkey
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pubkey: publicKey,
          testMode: true 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Test mode activated! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Test mode activation failed.');
      }
    } catch (err) {
      setError('Test mode activation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <img 
          src="/logo_big_light.png" 
          alt="ProofOfReach" 
          className="h-10 mx-auto"
        />
      </div>

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

      {/* Login with Nostr Button */}
      <button
        onClick={handleNostrLogin}
        disabled={isLoading}
        className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50 mb-4"
        style={{ backgroundColor: 'rgb(169, 21, 255)' }}
      >
        {isLoading ? 'Logging in...' : 'Login with Nostr'}
      </button>

      {/* Create Account Button */}
      <button
        onClick={handleCreateAccount}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 mb-4"
      >
        {isLoading ? 'Creating Account...' : 'Create an Account'}
      </button>

      {/* Test Mode Button */}
      <button
        onClick={handleTestMode}
        disabled={isLoading}
        className="w-full bg-yellow-200 text-gray-800 py-2 px-4 rounded-md hover:bg-yellow-300 disabled:opacity-50"
      >
        {isLoading ? 'Activating Test Mode...' : 'Test Mode'}
      </button>
    </div>
  );
};

// Use dynamic import to prevent SSR issues
const ClientLoginPage = dynamic(() => Promise.resolve(LoginPageClient), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  ),
});

// Main login page container with compact design
const LoginPage: React.FC = () => {
  return (
    <Layout title="Login - ProofofReach" hideTestBanner={true}>
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-lg dark:bg-gray-800">
          <ClientLoginPage />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;