import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { useAuth } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';

const OnboardingPage: NextPage = () => {
  const router = useRouter();
  const { auth, loading, isLoggedIn } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login?redirect=/onboarding');
    }
  }, [isLoggedIn, loading, router]);
  
  // If still loading auth state or not logged in, show loading
  if (loading || !isLoggedIn) {
    return (
      <Layout title="Loading Onboarding...">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout 
      title="Nostr Ads Onboarding"
      hideNavbar 
      fullWidth
      className="bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto py-8 px-4">
        <OnboardingProvider>
          <OnboardingWizard />
        </OnboardingProvider>
      </div>
    </Layout>
  );
};

export default OnboardingPage;