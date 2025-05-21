import React, { useState, useEffect } from 'react';
import { OnboardingStep, useOnboarding } from '@/context/OnboardingContext';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { CheckCircle, Search, ChevronRight, ChevronLeft, Check } from 'react-feather';
import { Switch } from '@/components/ui/switch';
import SkipButton from '@/components/ui/SkipButton';
import ProfileAvatar from '@/components/ProfileAvatar';

interface Publisher {
  id: string;
  name: string;
  description: string;
  initials: string;
  colorClass: string;
  followed: boolean;
}

interface ViewerOnboardingProps {
  currentStep?: OnboardingStep;
  onComplete?: () => void;
  showNavigation?: boolean;
  totalSteps?: number;
  skipOnboarding?: () => void;
}

const ViewerOnboarding: React.FC<ViewerOnboardingProps> = ({ 
  currentStep = 'role-selection', 
  onComplete,
  showNavigation = true,
  totalSteps: propTotalSteps,
  skipOnboarding
}) => {
  // Test ID for component
  const testId = 'viewer-onboarding';
  // Get context from OnboardingContext
  const { 
    progress, 
    goToNextStep, 
    goToPreviousStep,
    totalSteps: contextTotalSteps
  } = useOnboarding();
  // Real publishers with their actual Nostr hex pubkeys
  const [publishers, setPublishers] = useState<Publisher[]>([
    {
      id: '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
      name: 'Bitcoin Magazine',
      description: 'The world\'s first publication dedicated to Bitcoin',
      initials: 'BTC',
      colorClass: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
      followed: false
    },
    {
      id: '4523be58d395b1b196a9b8c82b038b6895cb02b683d0c253a955068dba1facd0',
      name: 'Stacker News',
      description: 'Bitcoin news and discussion with Lightning rewards',
      initials: 'SN',
      colorClass: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
      followed: false
    },
    {
      id: '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
      name: 'Nostr Watch',
      description: 'Updates and info about the Nostr protocol and ecosystem',
      initials: 'NW',
      colorClass: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
      followed: false
    },
    {
      id: 'e8ed3798c6ffebfec301ce4fd5b414a1c39640a34c255bbdbc642cfe6c0a959f',
      name: 'NOSTR.COM',
      description: 'Official account for NOSTR.COM project and ecosystem',
      initials: 'NC',
      colorClass: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
      followed: false
    },
    {
      id: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
      name: 'Current Thing App',
      description: 'The latest in Bitcoin, tech, and current topics',
      initials: 'CT',
      colorClass: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
      followed: false
    }
  ]);
  
  // State for privacy settings - using the same names as in settings page
  const [privacySettings, setPrivacySettings] = useState({
    shareLocation: false,
    shareInterests: true,
    shareBrowsing: false,
    shareAge: true
  });
  
  // Handle privacy setting changes
  const handlePrivacySettingChange = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle follow/unfollow publisher
  const toggleFollow = (publisherId: string) => {
    setPublishers(publishers.map(pub => 
      pub.id === publisherId ? { ...pub, followed: !pub.followed } : pub
    ));
  };
  
  // Map from OnboardingContext step names to local step names
  const mapOnboardingStepToLocal = (step: OnboardingStep): string => {
    // Start at discovery when a role is selected (welcome step removed)
    if (step === 'role-selection') {
      console.log("ViewerOnboarding - Mapped incoming step role-selection to discovery");
      return 'discovery';
    }
    
    // Define the sequence of steps in order - feedback step removed
    const stepSequence = [
      'discovery',
      'privacy',
      'complete'
    ];
    
    // Map context steps to our local steps
    const stepMap: Record<string, string> = {
      'role-selection': 'discovery',
      'preferences': 'discovery',
      'discovery': 'discovery', 
      'notifications': 'privacy', // Map notifications to privacy since we removed notifications step
      'privacy': 'privacy',
      'feedback': 'complete', // Map feedback to complete since we removed feedback step
      'complete': 'complete'
    };
    
    return stepMap[step] || 'discovery'; // Default to discovery if step is not recognized
  };
  
  // Initialize step from incoming currentStep prop
  const [step, setStep] = useState<string>(mapOnboardingStepToLocal(currentStep));
  
  // Update step if currentStep prop changes
  useEffect(() => {
    const mappedStep = mapOnboardingStepToLocal(currentStep);
    setStep(mappedStep);
    console.log('ViewerOnboarding - Mapped incoming step', currentStep, 'to', mappedStep);
  }, [currentStep]);
  
  // Initialize current step index and total steps for progress tracking
  // Welcome and Notifications steps removed as they're not needed
  const stepSequence = [
    'discovery',
    'privacy',
    'complete'
  ];
  
  // Add CSS for toggle switches
  React.useEffect(() => {
    // Add CSS for toggle switches if it doesn't exist already
    if (!document.getElementById('toggle-switch-styles')) {
      const style = document.createElement('style');
      style.id = 'toggle-switch-styles';
      style.innerHTML = `
        .toggle-checkbox:checked {
          right: 0;
          border-color: #68D391;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #68D391;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #D1D5DB;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: background-color 0.3s;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Calculate the current step number and total for display
  const currentStepIndex = stepSequence.indexOf(step);
  // Use prop totalSteps if provided, or context's totalSteps if available, otherwise use local calculation
  const calculatedTotalSteps = propTotalSteps || (contextTotalSteps > 0 ? contextTotalSteps : stepSequence.length);
  const currentStepNumber = currentStepIndex + 1;
  
  // The main component will show its own progress indicator when showNavigation is false
  const shouldShowProgress = showNavigation;

  const handleNext = () => {
    // First update the local step
    switch (step) {
      case 'discovery': 
        setStep('privacy');
        goToNextStep();
        break;
      case 'privacy':
        // Go directly to complete after privacy (feedback step removed)
        setStep('complete');
        goToNextStep();
        break;
      case 'complete':
        // Use setTimeout to ensure the state update has time to propagate
        // This helps with test stability and real-world scenarios
        setTimeout(() => {
          // When at the complete step, notify the OnboardingContext
          goToNextStep();
          if (onComplete) {
            onComplete();
          }
        }, 100);
        break;
      default:
        setStep('discovery');
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'privacy':
        setStep('discovery');
        goToPreviousStep();
        break;
      case 'complete':
        // Go directly back to privacy (feedback step removed)
        setStep('privacy');
        goToPreviousStep();
        break;
      default:
        setStep('discovery');
    }
  };
  
  // Navigation buttons are now handled by the parent OnboardingWizard component
  const renderNavButtons = () => {
    // Return empty div to maintain layout spacing if needed
    return <div className="mt-6"></div>;
  };

  const renderStepContent = () => {
    switch (step) {
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
                  {publishers.map(publisher => (
                    <div 
                      key={publisher.id}
                      className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      {/* Profile avatar replaces colored initials */}
                      <div className="mr-3">
                        <ProfileAvatar 
                          pubkey={publisher.id}
                          size="lg"
                          className="border-2 border-white dark:border-gray-800 shadow-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{publisher.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {publisher.description}
                        </p>
                        <div className="mt-2">
                          {publisher.followed ? (
                            <button 
                              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full dark:bg-green-900/50 dark:text-green-300 flex items-center"
                              disabled
                              data-testid={`followed-${publisher.id}`}
                            >
                              <Check size={14} className="mr-1" /> Followed
                            </button>
                          ) : (
                            <button 
                              onClick={() => toggleFollow(publisher.id)}
                              className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-300"
                              data-testid={`follow-${publisher.id}`}
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // Notifications step removed as it's not relevant for viewers browsing on third-party apps

      case 'privacy':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <CheckCircle className="inline-block mr-2 mb-1" size={20} />
              Privacy Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You are in full control of the data shared with advertisers. The more you're willing to share, the more bitcoin you can potentially earn! We've chosen some defaults that will get you earning sats right away.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Your Privacy Controls</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="shareLocation" className="flex items-center cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Country & State Data</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Allow advertisers to target based on your country and state only (no precise location)</p>
                    </div>
                    <Switch
                      id="shareLocation"
                      checked={privacySettings.shareLocation}
                      onCheckedChange={() => handlePrivacySettingChange('shareLocation')}
                      data-testid="share-location-toggle"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="shareInterests" className="flex items-center cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Interest-Based Ads</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Recommended)</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Allow ads based on your interests and preferences</p>
                    </div>
                    <Switch
                      id="shareInterests"
                      checked={privacySettings.shareInterests}
                      onCheckedChange={() => handlePrivacySettingChange('shareInterests')}
                      data-testid="share-interests-toggle"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="shareBrowsing" className="flex items-center cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Browsing Activity</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Allow limited tracking of content you view</p>
                    </div>
                    <Switch
                      id="shareBrowsing"
                      checked={privacySettings.shareBrowsing}
                      onCheckedChange={() => handlePrivacySettingChange('shareBrowsing')}
                      data-testid="share-browsing-toggle"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="shareAge" className="flex items-center cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Age Information</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Allow age-appropriate content targeting</p>
                    </div>
                    <Switch
                      id="shareAge"
                      checked={privacySettings.shareAge}
                      onCheckedChange={() => handlePrivacySettingChange('shareAge')}
                      data-testid="share-age-toggle"
                    />
                  </div>
                </div>
                
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  These settings apply to apps that integrate with our platform. Individual apps may have additional privacy controls.
                </p>
              </div>
            </div>
          </div>
        );

// Feedback step removed
      
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

  // Handle skip functionality
  const handleSkip = () => {
    if (skipOnboarding) {
      skipOnboarding();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm" data-testid="viewer-onboarding">
      <div className="px-6 pt-6">
        {shouldShowProgress && (
          <div className="w-full">
            <OnboardingProgress 
              customCurrentStep={currentStepNumber}
              customTotalSteps={calculatedTotalSteps}
              className="mb-2"
            />
            <div className="flex justify-end mt-1 mb-4">
              <SkipButton 
                onSkip={handleSkip}
                testId="viewer-skip-button"
              />
            </div>
          </div>
        )}
      </div>
      {renderStepContent()}
      {showNavigation && renderNavButtons()}
    </div>
  );
};

export default ViewerOnboarding;
