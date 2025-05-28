import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

const OnboardingPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Welcome to Proof Of Reach - Let's Get Started</title>
        <meta name="description" content="Complete your onboarding to start earning bitcoin by viewing ads or creating advertising campaigns." />
      </Head>
      
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <OnboardingProvider>
            <OnboardingWizard />
          </OnboardingProvider>
        </div>
      </div>
    </Layout>
  );
};

export default OnboardingPage;