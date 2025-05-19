import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { CheckCircle, Search, ChevronRight, ChevronLeft } from 'react-feather';

interface ViewerOnboardingProps {
  currentStep?: OnboardingStep;
  onComplete?: () => void;
}

const ViewerOnboarding: React.FC<ViewerOnboardingProps> = ({ currentStep = 'role-selection', onComplete }) => {
  // Map from OnboardingContext step names to local step names
  const mapOnboardingStepToLocal = (step: OnboardingStep): string => {
    const stepMap: Record<string, string> = {
      'role-selection': 'welcome',
      'preferences': 'welcome',
      'discovery': 'discovery',
      'notifications': 'discovery',
      'privacy': 'discovery',
      'feedback': 'complete',
      'complete': 'complete'
    };
    
    return stepMap[step] || 'welcome'; // Default to welcome if step is not recognized
  };
  
  // Initialize step from incoming currentStep prop
  const [step, setStep] = useState<string>(mapOnboardingStepToLocal(currentStep));
  
  // Update step if currentStep prop changes
  useEffect(() => {
    const mappedStep = mapOnboardingStepToLocal(currentStep);
    setStep(mappedStep);
    console.log('ViewerOnboarding - Mapped incoming step', currentStep, 'to', mappedStep);
  }, [currentStep]);

  const handleNext = () => {
    switch (step) {
      case 'welcome':
        setStep('discovery');
        break;
      case 'discovery': 
        setStep('complete');
        break;
      case 'complete':
        if (onComplete) onComplete();
        break;
      default:
        setStep('welcome');
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'discovery':
        setStep('welcome');
        break;
      case 'complete':
        setStep('discovery');
        break;
      default:
        setStep('welcome');
    }
  };
  
  const renderNavButtons = () => {
    if (step === 'welcome') {
      return (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            aria-label="Next"
          >
            Next <ChevronRight size={16} className="inline ml-1" />
          </button>
        </div>
      );
    } else if (step === 'complete') {
      return (
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            aria-label="Back"
          >
            <ChevronLeft size={16} className="inline mr-1" /> Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            aria-label="Complete"
          >
            Complete
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            aria-label="Back"
          >
            <ChevronLeft size={16} className="inline mr-1" /> Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            aria-label="Next"
          >
            Next <ChevronRight size={16} className="inline ml-1" />
          </button>
        </div>
      );
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <CheckCircle className="inline-block mr-2 mb-1" size={20} />
              Welcome to Nostr Ads
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              As a viewer, you'll experience personalized content:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Viewer Experience</h3>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                      <CheckCircle size={18} className="mt-0.5" />
                    </div>
                    <p className="ml-2 text-gray-600 dark:text-gray-300">
                      Browse content
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                      <CheckCircle size={18} className="mt-0.5" />
                    </div>
                    <p className="ml-2 text-gray-600 dark:text-gray-300">
                      Relevant ads
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                      <CheckCircle size={18} className="mt-0.5" />
                    </div>
                    <p className="ml-2 text-gray-600 dark:text-gray-300">
                      Control privacy settings
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'discovery':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Search className="inline-block mr-2 mb-1" size={20} />
              Discover Personalized Content
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Follow publishers who create content you enjoy:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Recommended Publishers</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 mr-3">
                      BTC
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Bitcoin Magazine</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The world's first publication dedicated to Bitcoin
                      </p>
                      <div className="mt-2">
                        <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-300">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3">
                      NT
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Nostr Talk</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The latest news about the Nostr ecosystem
                      </p>
                      <div className="mt-2">
                        <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-300">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <CheckCircle className="inline-block mr-2 mb-1" size={20} />
              You're All Set!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You've completed the viewer onboarding process.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">What's Next?</h3>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                      <CheckCircle size={18} className="mt-0.5" />
                    </div>
                    <p className="ml-2 text-gray-600 dark:text-gray-300">
                      Browse content with relevant ads
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                      <CheckCircle size={18} className="mt-0.5" />
                    </div>
                    <p className="ml-2 text-gray-600 dark:text-gray-300">
                      Discover new content creators
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                      <CheckCircle size={18} className="mt-0.5" />
                    </div>
                    <p className="ml-2 text-gray-600 dark:text-gray-300">
                      Adjust preferences in your profile settings
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        // Debug information to help diagnose issues
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              Unknown step: {step}. Please go back and try again.
            </p>
            <p className="text-yellow-700 mt-2 text-xs">
              Received original step: {currentStep}
            </p>
            <button 
              onClick={() => setStep('welcome')}
              className="mt-3 px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
            >
              Go to Welcome
            </button>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <OnboardingProgress />
      {renderStepContent()}
      {renderNavButtons()}
    </div>
  );
};

export default ViewerOnboarding;
