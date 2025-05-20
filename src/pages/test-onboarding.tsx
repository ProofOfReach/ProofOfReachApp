import React from 'react';
import { OnboardingProvider } from '@/context/OnboardingContext';
import ViewerOnboarding from '@/components/onboarding/ViewerOnboarding';
import Head from 'next/head';

const TestOnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Test Onboarding Flow</title>
      </Head>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
          Viewer Onboarding Test
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <OnboardingProvider>
            <ViewerOnboarding />
          </OnboardingProvider>
        </div>
      </div>
    </div>
  );
};

export default TestOnboardingPage;