import React from 'react';
import { Target, CheckCircle } from 'react-feather';
import { useOnboarding } from '@/context/OnboardingContext';

interface AdvertiserOnboardingProps {
  currentStep: string;
  skipOnboarding: () => void;
  goToPreviousStep: () => void;
}

const AdvertiserOnboarding: React.FC<AdvertiserOnboardingProps> = ({ 
  currentStep, 
  skipOnboarding,
  goToPreviousStep
}) => {
  const { goToNextStep, completeOnboarding } = useOnboarding();

  // Content for the streamlined advertiser onboarding flow
  const renderStepContent = () => {
    switch (currentStep) {
      case 'create-campaign':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome, Advertiser!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Let's get you started with quick setup
              </p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name <span className="text-gray-400">(optional)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Your business name" 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What's your main advertising goal?
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-orange-500">
                  <option value="">Select your goal</option>
                  <option value="brand-awareness">Brand Awareness</option>
                  <option value="website-traffic">Drive Website Traffic</option>
                  <option value="lead-generation">Generate Leads</option>
                  <option value="sales">Increase Sales</option>
                  <option value="app-downloads">App Downloads</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button 
                onClick={goToNextStep}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
            
            <div className="text-center">
              <button 
                onClick={skipOnboarding}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Skip setup - go to dashboard
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                You're All Set!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Welcome to your advertiser dashboard. Let's create your first campaign!
              </p>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  Quick Start Tips:
                </h3>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1 text-left">
                  <li>• Create your first campaign using the "New Campaign" button</li>
                  <li>• Set your budget and targeting preferences</li>
                  <li>• Monitor performance in real-time</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => completeOnboarding()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Unknown step: {currentStep}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {renderStepContent()}
    </div>
  );
};

export default AdvertiserOnboarding;