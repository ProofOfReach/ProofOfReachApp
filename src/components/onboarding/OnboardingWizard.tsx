import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import OnboardingProgress from './OnboardingProgress';
import RoleConfirmation from './RoleConfirmation';
import ViewerOnboarding from './ViewerOnboarding';
import PublisherOnboarding from './PublisherOnboarding';
import AdvertiserOnboarding from './AdvertiserOnboarding';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'react-feather';
import { UserRoleType } from '@/types/role';

const OnboardingWizard: React.FC = () => {
  const { 
    currentStep, 
    goToNextStep, 
    goToPreviousStep, 
    isFirstStep, 
    isLastStep,
    selectedRole,
    completeOnboarding,
    isLoading,
    skipOnboarding
  } = useOnboarding();
  
  // Handle invalid role case - Only when skipOnboarding is available
  React.useEffect(() => {
    // If we have an invalid role and not on role-selection,
    // go back to role selection
    if (currentStep !== 'role-selection' && 
        selectedRole !== 'viewer' && 
        selectedRole !== 'publisher' && 
        selectedRole !== 'advertiser' &&
        typeof skipOnboarding === 'function') {
      // Go back to role selection if we have an invalid role
      skipOnboarding();
    }
  }, [currentStep, selectedRole, skipOnboarding]);
  
  // Handle role selection from RoleConfirmation
  const handleRoleSelection = (role: UserRoleType) => {
    if (typeof goToNextStep === 'function') {
      goToNextStep();
    }
  };
  
  // Render the current step content based on step and selected role
  const renderStepContent = () => {
    // Show loading indicator when loading
    if (isLoading) {
      return <Loading className="py-10" />;
    }
    
    if (currentStep === 'role-selection') {
      return <RoleConfirmation onConfirm={handleRoleSelection} />;
    }
    
    if (selectedRole === 'viewer') {
      return <ViewerOnboarding 
        currentStep={currentStep} 
        onComplete={completeOnboarding}
        showNavigation={false} 
      />;
    }
    
    if (selectedRole === 'publisher') {
      return <PublisherOnboarding 
        currentStep={currentStep} 
        onComplete={completeOnboarding} 
        skipOnboarding={skipOnboarding} 
      />;
    }
    
    if (selectedRole === 'advertiser') {
      return <AdvertiserOnboarding 
        currentStep={currentStep} 
        onComplete={completeOnboarding} 
        skipOnboarding={skipOnboarding} 
      />;
    }
    
    // Fallback content
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Please select a role to continue.
        </p>
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isFirstStep ? 'Welcome to Proof Of Reach' : (
            selectedRole ? `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Onboarding` : 'Onboarding'
          )}
        </h1>
      </div>
      
      <div className="p-6">
        {currentStep !== 'role-selection' && (
          <div>
            <OnboardingProgress />
            <div className="flex justify-end mt-1 mb-4">
              <Button 
                onClick={goToNextStep}
                variant="secondary"
                size="sm"
                aria-label="Skip to next step"
                data-testid="onboarding-skip-button"
                className="bg-blue-100 text-[#1a73e8] border border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50"
              >
                Skip to next step
              </Button>
            </div>
          </div>
        )}
        {renderStepContent()}
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        {!isFirstStep ? (
          <button
            onClick={goToPreviousStep}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            data-testid="back-button"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}
        
        {isLastStep ? (
          <button
            onClick={() => {
              // First try the onboarding context function
              if (completeOnboarding) {
                completeOnboarding();
              } else {
                // Fallback for test environments - direct to dashboard
                window.location.href = '/dashboard';
              }
            }}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-[#1a73e8] hover:bg-[#1765cc] text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="complete-button"
          >
            {isLoading ? 'Completing...' : 'Complete Setup'}
          </button>
        ) : (
          <button
            onClick={goToNextStep}
            className="flex items-center px-4 py-2 bg-[#1a73e8] hover:bg-[#1765cc] text-white rounded-md transition"
            data-testid="next-button"
          >
            {isFirstStep ? 'Get Started' : 'Continue'}
            <ArrowRight size={16} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;