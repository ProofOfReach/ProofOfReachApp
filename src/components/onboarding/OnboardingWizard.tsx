import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuthRefactored } from '@/hooks/useAuthRefactored';
import RoleConfirmation from './RoleConfirmation';
import ViewerOnboarding from './ViewerOnboarding';
import PublisherOnboarding from './PublisherOnboarding';
import AdvertiserOnboarding from './AdvertiserOnboarding';
import OnboardingProgress from './OnboardingProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Main onboarding wizard component that orchestrates the entire onboarding flow
 */
const OnboardingWizard: React.FC = () => {
  const router = useRouter();
  const { authState, isLoggedIn } = useAuthRefactored();
  const {
    isOnboarding,
    role,
    currentStep,
    progress,
    isRoleConfirmed,
    startOnboarding,
    confirmRole,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding
  } = useOnboarding();

  // Check if the user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Automatically start onboarding if the user is logged in and not already onboarding
  useEffect(() => {
    if (isLoggedIn && !isOnboarding && authState.pubkey) {
      // Use the user's current role as the default
      startOnboarding(authState.currentRole as any);
    }
  }, [isLoggedIn, isOnboarding, authState.pubkey, authState.currentRole, startOnboarding]);

  // If the user isn't logged in, show nothing while redirecting
  if (!isLoggedIn) {
    return null;
  }

  // Step 1: Role Confirmation
  if (!isRoleConfirmed) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome to Nostr Ad Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleConfirmation
              selectedRole={role}
              onRoleSelect={confirmRole}
              pubkey={authState.pubkey}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role-specific onboarding steps
  const renderOnboardingContent = () => {
    switch (role) {
      case 'viewer':
        return <ViewerOnboarding currentStep={currentStep} />;
      case 'publisher':
        return <PublisherOnboarding currentStep={currentStep} />;
      case 'advertiser':
        return <AdvertiserOnboarding currentStep={currentStep} />;
      default:
        return <ViewerOnboarding currentStep={currentStep} />;
    }
  };

  // Determine if this is the final step
  const isFinalStep = currentStep === 'complete';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            {role.charAt(0).toUpperCase() + role.slice(1)} Onboarding
          </CardTitle>
          <OnboardingProgress progress={progress} />
        </CardHeader>
        
        <CardContent>
          {renderOnboardingContent()}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === (role === 'viewer' ? 'select-interests' : 
                      role === 'publisher' ? 'choose-integration' : 'create-campaign')}
          >
            Previous
          </Button>
          
          <Button variant="ghost" onClick={skipOnboarding}>
            Skip for now
          </Button>
          
          <Button 
            onClick={isFinalStep ? completeOnboarding : nextStep}
          >
            {isFinalStep ? 'Complete' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingWizard;