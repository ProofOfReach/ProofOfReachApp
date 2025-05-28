import React, { useState, useEffect, useMemo } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { CheckCircle, Search, ChevronRight, ChevronLeft, Check } from 'react-feather';
import { Switch } from '@/components/ui/Switch';
import { SkipButton } from '@/components/ui/SkipButton';
import ProfileAvatar from '@/components/ProfileAvatar';

// Type definitions
type OnboardingStep = 'role-selection' | 'discovery' | 'privacy' | 'complete';

// Helper function to check for Nostr extension
const checkForNostrExtension = (): boolean => {
  return typeof window !== 'undefined' && !!window.nostr;
};

// Defining local step types more clearly
type LocalStep = 'discovery' | 'privacy' | 'complete';

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
  // Real publishers with their actual Nostr hex pubkeys, properly matched with names
  const [publishers, setPublishers] = useState<Publisher[]>([
    {
      id: '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
      name: 'jack',
      description: 'Bitcoin advocate, no state is the best state',
      initials: 'JC',
      colorClass: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
      followed: false
    },
    {
      id: '4523be58d395b1b196a9b8c82b038b6895cb02b683d0c253a955068dba1facd0',
      name: 'Martti Malmi',
      description: 'Developing iris.to, Bitcoin and Nostr contributor',
      initials: 'MM',
      colorClass: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
      followed: false
    },
    {
      id: '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
      name: 'jb55',
      description: 'Creator of Damus, npubs, and zaps ⚡️',
      initials: 'JB',
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
      name: 'PABLOF7z',
      description: 'Magical Other Stuff Maximalist, Nostr developer',
      initials: 'PF',
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
  
  // Removed automatic Nostr extension detection - users should explicitly choose their path

  // Map from OnboardingContext step names to local step names
  const mapOnboardingStepToLocal = useMemo(() => {
    return (step: OnboardingStep): LocalStep => {
      // Standard flow for all viewers: discovery -> privacy -> complete
      // Note: role-selection step is handled by OnboardingWizard, not ViewerOnboarding
      if (step === 'role-selection' || step === 'preferences' || step === 'discovery') {
        console.log("ViewerOnboarding - Standard flow (Step 1/3: Discovery)");
        return 'discovery';
      }
      
      if (step === 'privacy' || step === 'notifications') {
        console.log("ViewerOnboarding - Standard flow (Step 2/3: Privacy)");
        return 'privacy';
      }
      
      console.log("ViewerOnboarding - Standard flow (Step 3/3: Complete)");
      return 'complete';
    };
  }, []);
  
  // Initialize step from incoming currentStep prop
  const [step, setStep] = useState<LocalStep>(() => mapOnboardingStepToLocal(currentStep));
  
  // Update step if currentStep prop changes
  useEffect(() => {
    const mappedStep = mapOnboardingStepToLocal(currentStep);
    setStep(mappedStep);
    console.log('ViewerOnboarding - Mapped incoming step', currentStep, 'to', mappedStep);
  }, [currentStep, mapOnboardingStepToLocal]);
  
  // Initialize current step index and total steps for progress tracking
  // Standard 3-step flow for all viewers: Discovery → Privacy → Complete
  const stepSequence = useMemo(() => {
    console.log('ViewerOnboarding - Using standard 3-step flow for all users');
    return [
      'discovery', // Step 1/3: Discover Publishers
      'privacy',   // Step 2/3: Privacy Settings
      'complete'   // Step 3/3: You're All Set!
    ];
  }, []);
  
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
  
  // Standard 3-step flow for all users: Discovery(1) → Privacy(2) → Complete(3)
  const calculatedTotalSteps = 3;
  
  // Map step based on stepSequence for consistent numbering
  const displayStepNumber = currentStepIndex + 1;
  
  console.log(`ViewerOnboarding - Standard flow (Step ${displayStepNumber}/${calculatedTotalSteps}: ${step})`);
  
  // The main component will show its own progress indicator when showNavigation is false
  const shouldShowProgress = showNavigation;

  const handleNext = () => {
    // First update the local step
    console.log(`ViewerOnboarding - Handling next from step: ${step}`);
    
    switch (step) {
      case 'discovery': 
        console.log('ViewerOnboarding - Moving from Discovery to Privacy step');
        setStep('privacy');
        goToNextStep();
        break;
        
      case 'privacy':
        console.log('ViewerOnboarding - Moving from Privacy to Complete step');
        setStep('complete');
        goToNextStep();
        break;
        
      case 'complete':
        console.log('ViewerOnboarding - Completing onboarding process');
        // Use setTimeout to ensure the state update has time to propagate
        // This helps with test stability and real-world scenarios
        setTimeout(() => {
          goToNextStep();
          if (onComplete) {
            onComplete();
          }
        }, 100);
        break;
        
      default:
        // All users start with discovery step in the standard flow
        console.log('ViewerOnboarding - Starting with Discovery step');
        setStep('discovery');
    }
  };

  const handleBack = () => {
    console.log('ViewerOnboarding - Handling back navigation from step:', step);
    
    switch (step) {
      case 'privacy':
        // Standard flow: go back to discovery step
        console.log('ViewerOnboarding - Going back from Privacy to Discovery');
        setStep('discovery');
        goToPreviousStep();
        break;
      
      case 'complete':
        // Go back to privacy step
        console.log('ViewerOnboarding - Going back from Complete to Privacy');
        setStep('privacy');
        goToPreviousStep();
        break;
      
      default:
        // Only happens for regular users on discovery step
        console.log('ViewerOnboarding - Going back from Discovery to role selection');
        goToPreviousStep(); // Goes back to role selection (outside this component)
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Privacy Settings
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                ₿ <strong className="text-orange-400">Higher earnings potential:</strong> Sharing more data helps us show you more relevant ads, 
                which typically means higher click rates and more bitcoin earnings for you.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Data Sharing Preferences</h3>
                
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
              onClick={() => setStep('privacy' as LocalStep)}
              className="mt-3 px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
            >
              Go to Privacy Settings
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
              customCurrentStep={displayStepNumber}
              customTotalSteps={calculatedTotalSteps}
              className="mb-2"
            />
            <div className="flex justify-end mt-1 mb-4">
              <SkipButton 
                onClick={handleSkip}
                className="viewer-skip-button"
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
