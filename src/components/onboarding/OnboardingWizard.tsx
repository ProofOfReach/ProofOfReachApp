import React, { useState, useEffect } from 'react';
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
  // Track if component is mounted in client-side environment
  const [isClient, setIsClient] = useState(false);
  
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
  
  // Set client-side state after mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Handle invalid role case - Only when skipOnboarding is available
  useEffect(() => {
    // Skip this check during server-side rendering
    if (typeof window === 'undefined' || !isClient) {
      return;
    }
    
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
  }, [currentStep, selectedRole, skipOnboarding, isClient]);
  
  // Handle role selection from RoleConfirmation
  const handleRoleSelection = (role: UserRoleType) => {
    if (typeof goToNextStep === 'function') {
      goToNextStep();
    }
  };
  
  // Render the current step content based on step and selected role
  const renderStepContent = () => {
    // For SSR compatibility, use a consistent initial rendering structure
    // This prevents hydration errors by ensuring server and client render the same initial structure
    
    // During server-side rendering or initial client render, show a simple loading state
    // This ensures we have the same structure during hydration
    if (!isClient) {
      return (
        <div className="p-6 text-center" data-testid="onboarding-loading-placeholder">
          <p className="text-gray-600 dark:text-gray-300">
            Loading onboarding experience...
          </p>
        </div>
      );
    }
    
    // Show loading indicator when loading
    if (isLoading) {
      return <Loading className="py-10" />;
    }
    
    // Role selection step
    if (currentStep === 'role-selection') {
      return <RoleConfirmation onConfirm={handleRoleSelection} />;
    }
    
    // Viewer onboarding steps
    if (selectedRole === 'viewer') {
      return <ViewerOnboarding 
        currentStep={currentStep} 
        onComplete={completeOnboarding}
        showNavigation={false} 
      />;
    }
    
    // Publisher onboarding steps
    if (selectedRole === 'publisher') {
      return <PublisherOnboarding 
        currentStep={currentStep} 
        onComplete={completeOnboarding} 
        skipOnboarding={skipOnboarding} 
      />;
    }
    
    // Advertiser onboarding steps
    if (selectedRole === 'advertiser') {
      return <AdvertiserOnboarding 
        currentStep={currentStep} 
        onComplete={completeOnboarding} 
        skipOnboarding={skipOnboarding} 
      />;
    }
    
    // Fallback content - ensure this has the same structure during SSR and CSR
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
        {/* Only show the progress bar and skip button if we're not on role selection and client-side rendered */}
        {isClient && currentStep !== 'role-selection' && (
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
      
      {/* Only show navigation buttons if client-side rendered to avoid hydration issues */}
      {isClient && (
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
      )}
      
      {/* During server-side rendering, show a placeholder footer that matches the structure */}
      {!isClient && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div></div>
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-transparent">Placeholder</div>
        </div>
      )}
    </div>
  );
};

export default OnboardingWizard;