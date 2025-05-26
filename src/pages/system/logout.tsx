import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Logout: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear any authentication data
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // Redirect to home page after logout
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [router]);

  return (
    <>
      <Head>
        <title>Logging Out - ProofOfReach</title>
        <meta name="description" content="Logging out of ProofOfReach" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Logging Out</h1>
          <p className="text-gray-600 mb-4">You are being logged out of ProofOfReach.</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    </>
  );
};

export default Logout;