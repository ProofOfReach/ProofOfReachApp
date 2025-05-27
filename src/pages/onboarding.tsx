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

  useEffect(() => {
    // Check if user has Nostr extension
    setHasNostrExtension(nostrLib.hasNostrExtension());
  }, []);

  const steps = [
    { number: 1, title: 'Welcome', icon: User },
    { number: 2, title: 'Choose Role', icon: Shield },
    { number: 3, title: 'Connect Wallet', icon: Key },
    { number: 4, title: 'Complete', icon: CheckCircle }
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
    if (currentStep < 4) {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pubkey,
          preferredRole: selectedRole,
          isOnboarding: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to dashboard
        router.push('/dashboard');
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
              <img 
                src="/logo_big_light.png" 
                alt="Proof Of Reach" 
                className="h-16 mx-auto mb-6"
              />
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to Proof Of Reach
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Join the decentralized advertising revolution. Connect with your audience through authentic, value-driven content.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Choose Your Role
            </h2>
            <p className="text-gray-300 text-center mb-8">
              Select how you'd like to participate in the marketplace
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedRole === role.id
                      ? 'border-orange-500 bg-gray-700'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center mb-4`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-gray-300 mb-4">{role.description}</p>
                  <ul className="space-y-1">
                    {role.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
                disabled={!selectedRole}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Connect Your Wallet
            </h2>
            <p className="text-gray-300 text-center mb-8">
              Connect with Nostr to secure your account and enable transactions
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <button
                onClick={handleNostrConnect}
                disabled={isLoading || !hasNostrExtension}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting...' : 'Connect with Nostr Extension'}
              </button>

              {!hasNostrExtension && (
                <div className="p-4 bg-yellow-900/50 border border-yellow-500 text-yellow-300 rounded-lg">
                  <p className="font-semibold mb-2">No Nostr Extension Detected</p>
                  <p className="text-sm">Install a Nostr browser extension like Alby or nos2x to continue.</p>
                </div>
              )}

              <div className="text-center text-gray-400">or</div>

              <button
                onClick={handleTestMode}
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Activating...' : 'Use Test Mode (Demo Account)'}
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
              >
                Back
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Account Created Successfully!
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Welcome to Proof Of Reach! Your {selectedRole} account is ready.
              </p>
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-400 mb-2">Your Public Key:</p>
                <p className="text-white font-mono text-xs break-all">{pubkey}</p>
              </div>
            </div>
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Setting up account...' : 'Enter Dashboard'}
            </button>
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