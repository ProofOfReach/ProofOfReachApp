import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingService from '@/lib/onboardingService';
import { logger } from '@/lib/logger';
import Loading from '@/components/ui/loading';

// This page handles the onboarding flow for users
export default function OnboardingPage() {
  const router = useRouter();
  const { isLoggedIn, loading, auth } = useAuthRefactored();
  const [showRoleConfirmation, setShowRoleConfirmation] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Handle case when user is not logged in
    if (!loading && !isLoggedIn) {
      logger.debug('User not logged in, redirecting to login page');
      router.push('/login');
      return;
    }

    // Check if onboarding is already complete for this role
    const checkOnboardingStatus = async () => {
      if (isLoggedIn && auth?.pubkey && auth?.currentRole) {
        try {
          const isComplete = await OnboardingService.isOnboardingComplete(
            auth.pubkey, 
            auth.currentRole
          );

          if (isComplete) {
            logger.debug(`Onboarding already complete for ${auth.currentRole}, redirecting to dashboard`);
            setIsRedirecting(true);
            router.push(`/dashboard/${auth.currentRole}`);
          } else {
            // Determine if we need to show role confirmation
            // For now, we'll show it for all users to confirm their role before starting onboarding
            setShowRoleConfirmation(true);
          }
        } catch (error) {
          logger.error('Error checking onboarding status:', error);
        }
      }
    };

    if (!loading && isLoggedIn) {
      checkOnboardingStatus();
    }
  }, [loading, isLoggedIn, auth, router]);

  // Show loading state while checking auth status
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
        <p className="ml-4 text-lg">
          {isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // Once logged in, show the onboarding wizard
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <OnboardingWizard showRoleConfirmation={showRoleConfirmation} />
      </div>
    </OnboardingProvider>
  );
}

// Server-side props (optional)
export const getServerSideProps: GetServerSideProps = async (context) => {
  // You can add server-side logic here if needed
  return {
    props: {},
  };
};