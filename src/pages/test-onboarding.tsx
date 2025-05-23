import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import "./components/onboarding/OnboardingWizard';
import "./context/OnboardingContext';
import dynamic from 'next/dynamic';

// Create a client-only wrapper
const ClientOnlyComponent = dynamic(() => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>), { ssr: false });

const TestOnboardingPage: React.FC = () => {
  // Client-side only render to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Head>
          <title>Test Onboarding Flow</title>
        </Head>
        <div className="max-w-3xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
            Onboarding Test
          </h1>
          <div className="flex justify-center py-10">
            <div className="text-center text-gray-600 dark:text-gray-300">
              Loading onboarding wizard...
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Test Onboarding Flow</title>
      </Head>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
          Onboarding Test
        </h1>
        <ClientOnlyComponent>
          <OnboardingProvider>
            <OnboardingWizard />
          </OnboardingProvider>
        </ClientOnlyComponent>
      </div>
    </div>
  );
};

export default TestOnboardingPage;