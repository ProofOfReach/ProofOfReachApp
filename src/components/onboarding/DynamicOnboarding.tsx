import React, { useState, useEffect } from 'react';
import OnboardingWizard from './OnboardingWizard';
import "./context/OnboardingContext';
import "./types/role';
import "./components/Loading';

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
  // Only mount the onboarding components after the component is hydrated
  const [mounted, setMounted] = useState(false);
  
  // Using a longer delay to ensure the DOM is fully ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading indicator until component is mounted
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Loading onboarding experience...
        </p>
      </div>
    );
  }
  
  // Only render the actual onboarding flow once mounted
  return (
    <OnboardingProvider forcePubkey={pubkey} initialRole={initialRole}>
      <OnboardingWizard />
    </OnboardingProvider>
  );
};

export default DynamicOnboarding;