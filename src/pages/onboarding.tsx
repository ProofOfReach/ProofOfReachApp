import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import { User, Key, Shield, ArrowRight, CheckCircle } from 'react-feather';
import * as nostrLib from '../lib/nostr';

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [hasNostrExtension, setHasNostrExtension] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareLocation: true,
    shareInterests: true,
    shareBrowsing: false,
    shareAge: true,
    emailNotifications: true,
    dataSharing: true
  });

  useEffect(() => {
    // Check if user has Nostr extension
    setHasNostrExtension(nostrLib.hasNostrExtension());
  }, []);

  const steps = [
    { number: 1, title: 'Choose Role', icon: Shield },
    { number: 2, title: 'Privacy Settings', icon: User },
    { number: 3, title: 'Complete', icon: CheckCircle }
  ];

  const roles = [
    {
      id: 'viewer',
      title: 'Viewer',
      description: 'Browse and interact with content',
      color: 'from-blue-500 to-blue-600',
      features: ['View ads', 'Earn rewards', 'Basic features']
    },
    {
      id: 'publisher',
      title: 'Publisher',
      description: 'Monetize your content with ads',
      color: 'from-green-500 to-green-600',
      features: ['Display ads', 'Earn revenue', 'Content management']
    },
    {
      id: 'advertiser',
      title: 'Advertiser',
      description: 'Promote your products and services',
      color: 'from-purple-500 to-purple-600',
      features: ['Create campaigns', 'Target audiences', 'Analytics']
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handlePrivacySettingChange = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleNostrConnect = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!hasNostrExtension) {
        setError('Please install a Nostr browser extension to continue.');
        return;
      }

      const userPubkey = await nostrLib.getNostrPublicKey();
      if (!userPubkey) {
        setError('Failed to get public key from Nostr extension.');
        return;
      }

      setPubkey(userPubkey);
      handleNext();
    } catch (err) {
      setError('Failed to connect with Nostr extension.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { privateKey, publicKey } = nostrLib.generateTestKeyPair();
      nostrLib.storeTestKeys(privateKey, publicKey);
      nostrLib.enableTestMode();
      setPubkey(publicKey);
      handleNext();
    } catch (err) {
      setError('Failed to activate test mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get the public key from stored test keys (generated when "Create Account" was clicked)
      const storedKeys = nostrLib.getStoredTestKeys();
      if (!storedKeys?.publicKey) {
        setError('No account keys found. Please try creating an account again.');
        return;
      }

      // Send login request to create account with selected role and privacy settings
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pubkey: storedKeys.publicKey,
          preferredRole: selectedRole,
          privacySettings: privacySettings,
          isOnboarding: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to appropriate dashboard based on role
        const dashboardPath = `/${selectedRole}`;
        router.push(dashboardPath);
      } else {
        setError(data.message || 'Account creation failed.');
      }
    } catch (err) {
      setError('Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Choose Your Role
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                Select how you'd like to participate in the Proof Of Reach ecosystem.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    selectedRole === role.id
                      ? 'border-orange-500 bg-gray-700/50'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className={`bg-gradient-to-r ${role.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-gray-300 mb-4">{role.description}</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {role.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {selectedRole && (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Privacy Settings
            </h2>
            <p className="text-gray-300 text-center mb-8">
              Choose how you'd like to share your data to improve your experience
            </p>
            
            <div className="max-w-2xl mx-auto space-y-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Data Sharing Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Share Location Data</p>
                      <p className="text-sm text-gray-400">Help us show relevant local ads</p>
                    </div>
                    <button
                      onClick={() => handlePrivacySettingChange('shareLocation')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.shareLocation ? 'bg-orange-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.shareLocation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Share Interests</p>
                      <p className="text-sm text-gray-400">Get personalized ad recommendations</p>
                    </div>
                    <button
                      onClick={() => handlePrivacySettingChange('shareInterests')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.shareInterests ? 'bg-orange-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.shareInterests ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Share Browsing History</p>
                      <p className="text-sm text-gray-400">Improve ad targeting accuracy</p>
                    </div>
                    <button
                      onClick={() => handlePrivacySettingChange('shareBrowsing')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.shareBrowsing ? 'bg-orange-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.shareBrowsing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Share Age Range</p>
                      <p className="text-sm text-gray-400">Help us show age-appropriate content</p>
                    </div>
                    <button
                      onClick={() => handlePrivacySettingChange('shareAge')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.shareAge ? 'bg-orange-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.shareAge ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Communication Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates about campaigns and earnings</p>
                    </div>
                    <button
                      onClick={() => handlePrivacySettingChange('emailNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.emailNotifications ? 'bg-orange-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Data Sharing with Partners</p>
                      <p className="text-sm text-gray-400">Share anonymized data to improve the platform</p>
                    </div>
                    <button
                      onClick={() => handlePrivacySettingChange('dataSharing')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.dataSharing ? 'bg-orange-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 inline-flex items-center"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Begin!
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Your {selectedRole} account is set up with your privacy preferences. Let's get started!
              </p>
              
              <div className="bg-gray-800 p-6 rounded-lg mb-6 text-left max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-white mb-3">Your Settings Summary:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="text-white capitalize font-medium">{selectedRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location Sharing:</span>
                    <span className={privacySettings.shareLocation ? "text-green-400" : "text-red-400"}>
                      {privacySettings.shareLocation ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interest Targeting:</span>
                    <span className={privacySettings.shareInterests ? "text-green-400" : "text-red-400"}>
                      {privacySettings.shareInterests ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email Notifications:</span>
                    <span className={privacySettings.emailNotifications ? "text-green-400" : "text-red-400"}>
                      {privacySettings.emailNotifications ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 inline-flex items-center"
              >
                {isLoading ? 'Setting up account...' : 'Enter Dashboard'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        );



      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Onboarding - Proof Of Reach</title>
        <meta name="description" content="Join the decentralized advertising revolution" />
      </Head>

      <Layout hideTestBanner={true}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex justify-center items-center space-x-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  
                  return (
                    <div key={step.number} className="flex items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isActive 
                            ? 'bg-orange-500 border-orange-500 text-white' 
                            : 'border-gray-600 text-gray-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="ml-3 hidden md:block">
                        <p className={`text-sm font-semibold ${
                          isActive ? 'text-orange-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          Step {step.number}
                        </p>
                        <p className={`text-xs ${
                          isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 ml-8 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-600'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default OnboardingPage;