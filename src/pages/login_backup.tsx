import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';

// Create a clean, compact login component
const LoginPageClient: React.FC = () => {
  const router = useRouter();
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

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Login logic would go here
      setMessage('Login successful!');
    } catch (err) {
      setError('Login failed. Please try again.');
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

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login with Nostr'}
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
    <Layout title="Login - Nostr Ad Marketplace" hideTestBanner={true}>
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-lg dark:bg-gray-800">
          <ClientLoginPage />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;