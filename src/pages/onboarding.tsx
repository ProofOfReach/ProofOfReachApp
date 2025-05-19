import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';

/**
 * Onboarding page that guides users through the role-specific onboarding process
 */
const OnboardingPage: NextPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthRefactored();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  return (
    <>
      <Head>
        <title>Get Started - Nostr Ad Marketplace</title>
        <meta name="description" content="Set up your account and get started with the Nostr Ad Marketplace" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <OnboardingProvider>
          <OnboardingWizard />
        </OnboardingProvider>
      </div>
    </>
  );
};

export default OnboardingPage;