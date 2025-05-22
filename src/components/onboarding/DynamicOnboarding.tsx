import React from 'react';
import OnboardingWizard from './OnboardingWizard';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { UserRoleType } from '@/types/role';

interface DynamicOnboardingProps {
  pubkey?: string;
  initialRole?: UserRoleType;
}

/**
 * Client-side only onboarding component
 * This component handles the entire onboarding flow on the client side only,
 * preventing any hydration issues from server-side rendering
 */
const DynamicOnboarding: React.FC<DynamicOnboardingProps> = ({ 
  pubkey, 
  initialRole 
}) => {
  return (
    <OnboardingProvider forcePubkey={pubkey} initialRole={initialRole}>
      <OnboardingWizard />
    </OnboardingProvider>
  );
};

export default DynamicOnboarding;