import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Code, DollarSign, Layout, Settings, CheckCircle, ToggleRight, Archive, Copy, RefreshCw, Eye, EyeOff } from 'react-feather';
import CodeSnippet from '@/components/ui/CodeSnippet';
import SkipButton from '@/components/ui/SkipButton';

interface PublisherOnboardingProps {
  currentStep: OnboardingStep;
  onComplete?: () => void;
  skipOnboarding?: () => void;
}

type IntegrationType = 'simple' | 'javascript' | 'sdk' | null;

interface ApiKeyData {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  scopes: string;
  isLoading: boolean;
  error: string | null;
}

// Use React.memo for performance optimization to prevent unnecessary re-renders
const PublisherOnboarding: React.FC<PublisherOnboardingProps> = React.memo(({ currentStep, onComplete, skipOnboarding }) => {
  // Make sure skipOnboarding exists, falling back to onComplete if needed
  const handleSkip = skipOnboarding || onComplete;
  // State to track which integration method was selected
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>('sdk');
  // API Key data to display to the user
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({
    id: '',
    key: '',
    name: '',
    createdAt: '',
    scopes: '',
    isLoading: false,
    error: null
  });
  // State to show/hide the API key
  const [showApiKey, setShowApiKey] = useState(false);
  // State to track if API key copy was successful
  const [copySuccess, setCopySuccess] = useState(false);
  // State to track if API key is being refreshed
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State to show/hide test mode
  const [enableTestMode, setEnableTestMode] = useState(true);
  // State to track completion of onboarding steps
  const [stepCompleted, setStepCompleted] = useState(false);

  // Get the current user's pubkey for API key generation
  const [currentUserPubkey, setCurrentUserPubkey] = useState<string>('');
  const [isTestModeActive, setIsTestModeActive] = useState<boolean>(false);

  // Check if test mode is active
  useEffect(() => {
    // Check localStorage for test mode flag
    const testMode = localStorage.getItem('isTestMode') === 'true';
    setIsTestModeActive(testMode);
    
    // Get user pubkey (either real or test)
    const pubkey = testMode 
      ? localStorage.getItem('nostr_test_pk') 
      : localStorage.getItem('nostr_real_pk');
    
    if (pubkey) {
      setCurrentUserPubkey(pubkey);
    }
  }, []);

  // Function to generate a real API key
  const generateRealApiKey = async (pubkey: string) => {
    try {
      setApiKeyData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // In test mode, create a test API key without making a real API call
      if (isTestModeActive || localStorage.getItem('bypass_api_calls') === 'true') {
        // Create a deterministic but realistic-looking API key for test mode
        const testKey = `sk_test_${pubkey.substring(0, 8)}${Math.random().toString(36).substring(2, 10)}x${Math.random().toString(36).substring(2, 10)}`;
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setApiKeyData({
          id: `pub_${pubkey.substring(0, 8)}`,
          key: testKey,
          name: 'Publisher API Key',
          createdAt: new Date().toISOString(),
          scopes: 'publisher:read,publisher:write,ad:serve',
          isLoading: false,
          error: null
        });
        
        return;
      }
      
      // Make an API call to create a real API key (for production use)
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Publisher API Key',
          scopes: 'publisher:read,publisher:write,ad:serve',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create API key');
      }
      
      const apiKey = await response.json();
      
      setApiKeyData({
        id: apiKey.id || `pub_${pubkey.substring(0, 8)}`,
        key: apiKey.key || `sk_live_${pubkey.substring(0, 8)}${Math.random().toString(36).substring(2, 15)}`,
        name: apiKey.name || 'Publisher API Key',
        createdAt: apiKey.createdAt || new Date().toISOString(),
        scopes: apiKey.scopes || 'publisher:read,publisher:write,ad:serve',
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      // Fall back to a deterministic key based on the user's pubkey
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fallbackKey = `sk_${isTestModeActive ? 'test' : 'live'}_${pubkey.substring(0, 8)}${randomSuffix}`;
      
      setApiKeyData({
        id: `pub_${pubkey.substring(0, 8)}`,
        key: fallbackKey,
        name: 'Publisher API Key',
        createdAt: new Date().toISOString(),
        scopes: 'publisher:read,publisher:write,ad:serve',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Fetch a new API key on component mount or integration type change
  useEffect(() => {
    if (currentStep === 'integration-details' && selectedIntegration && currentUserPubkey) {
      generateRealApiKey(currentUserPubkey);
    }
  }, [currentStep, selectedIntegration, currentUserPubkey]);

  // Toggle visibility of the API key
  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  // Copy API key to clipboard with visual feedback
  const copyApiKey = async () => {
    if (apiKeyData.key) {
      try {
        await navigator.clipboard.writeText(apiKeyData.key);
        // Show success indicator
        setCopySuccess(true);
        // Clear success indicator after 2 seconds
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy API key', err);
      }
    }
  };
  
  // Refresh API key
  const refreshApiKey = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // In test mode, create a test API key without making a real API call
      if (isTestModeActive || localStorage.getItem('bypass_api_calls') === 'true') {
        // Create a deterministic but realistic-looking API key for test mode
        const testKey = `sk_test_${currentUserPubkey.substring(0, 8)}${Math.random().toString(36).substring(2, 10)}x${Math.random().toString(36).substring(2, 10)}`;
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update the API key data
        setApiKeyData({
          id: `pub_${currentUserPubkey.substring(0, 8)}`,
          key: testKey,
          name: 'Publisher API Key',
          createdAt: new Date().toISOString(),
          scopes: 'publisher:read,publisher:write,ad:serve',
          isLoading: false,
          error: null
        });
        
        // Show the new key
        setShowApiKey(true);
        return;
      }
      
      // Make an API call to generate a new API key
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Publisher API Key',
          scopes: 'publisher:read,publisher:write,ad:serve',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new API key');
      }
      
      const apiKey = await response.json();
      
      // Update the API key data
      setApiKeyData({
        id: apiKey.id || `pub_${currentUserPubkey.substring(0, 8)}`,
        key: apiKey.key || `sk_live_${currentUserPubkey.substring(0, 8)}${Math.random().toString(36).substring(2, 15)}`,
        name: apiKey.name || 'Publisher API Key',
        createdAt: apiKey.createdAt || new Date().toISOString(),
        scopes: apiKey.scopes || 'publisher:read,publisher:write,ad:serve',
        isLoading: false,
        error: null
      });

      // Show the new key
      setShowApiKey(true);
      
    } catch (error) {
      console.error('Error refreshing API key:', error);
      // Create a new fallback key if refresh fails
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fallbackKey = `sk_${isTestModeActive ? 'test' : 'live'}_${currentUserPubkey.substring(0, 8)}${randomSuffix}`;
      
      setApiKeyData(prev => ({
        ...prev,
        key: fallbackKey,
        error: error instanceof Error ? error.message : 'Failed to refresh API key'
      }));
      
      // Show the new fallback key
      setShowApiKey(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Simulate continuing to the next step
  const handleContinue = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Render different content based on the current step
  const renderStepContent = () => {
    console.log('PublisherOnboarding - Current step:', currentStep);
    switch (currentStep) {
      case 'choose-integration':
      case 'integration-details':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Select Integration Method
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedIntegration === 'simple' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
                onClick={() => setSelectedIntegration('simple')}
              >
                <div className="flex items-center space-x-3">
                  <Code className="text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Simple Script Tag</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Add a single line of code to your website to start displaying ads.
                </p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedIntegration === 'javascript' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
                onClick={() => setSelectedIntegration('javascript')}
              >
                <div className="flex items-center space-x-3">
                  <Code className="text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">JavaScript SDK</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  More control with our JavaScript SDK. Perfect for complex websites.
                </p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedIntegration === 'sdk' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
                onClick={() => setSelectedIntegration('sdk')}
              >
                <div className="flex items-center space-x-3">
                  <Archive className="text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Server-Side SDK</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Maximum flexibility with our Node.js, Python, or Ruby SDK.
                </p>
              </div>
            </div>
            
            {selectedIntegration && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Your Publisher API Key</h4>
                {apiKeyData.isLoading ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generating your API key...</p>
                    </div>
                  </div>
                ) : apiKeyData.error ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-600 dark:text-red-400 text-sm mb-3">
                      <p>Error generating API key: {apiKeyData.error}</p>
                      <p className="mt-1">Using a fallback key based on your Nostr public key.</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Publisher API Key <span className="text-xs text-yellow-600 dark:text-yellow-400">(Fallback)</span>
                        </h5>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={toggleApiKeyVisibility}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                        >
                          {showApiKey ? (
                            <>
                              <Eye size={12} className="mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} className="mr-1" />
                              Show
                            </>
                          )}
                        </button>
                        <button 
                          onClick={copyApiKey}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                          disabled={copySuccess}
                        >
                          {copySuccess ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} className="mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                        <button 
                          onClick={refreshApiKey}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                          disabled={isRefreshing}
                        >
                          {isRefreshing ? (
                            <>
                              <div className="animate-spin h-3 w-3 border-b-2 border-purple-500 rounded-full mr-1"></div>
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={12} className="mr-1" />
                              Refresh
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 font-mono text-sm break-all">
                      {showApiKey 
                        ? apiKeyData.key 
                        : apiKeyData.key.replace(/./g, '•').substring(0, 12) + '...' + apiKeyData.key.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Publisher API Key
                        </h5>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={toggleApiKeyVisibility}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                        >
                          {showApiKey ? (
                            <>
                              <Eye size={12} className="mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} className="mr-1" />
                              Show
                            </>
                          )}
                        </button>
                        <button 
                          onClick={copyApiKey}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                          disabled={copySuccess}
                        >
                          {copySuccess ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} className="mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                        <button 
                          onClick={refreshApiKey}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                          disabled={isRefreshing}
                        >
                          {isRefreshing ? (
                            <>
                              <div className="animate-spin h-3 w-3 border-b-2 border-purple-500 rounded-full mr-1"></div>
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={12} className="mr-1" />
                              Refresh
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 font-mono text-sm break-all">
                      {showApiKey 
                        ? apiKeyData.key 
                        : apiKeyData.key.replace(/./g, '•').substring(0, 12) + '...' + apiKeyData.key.slice(-4)}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white">Integration Code</h4>
                  <CodeSnippet
                    language="javascript"
                    code={`// Install our SDK
npm install @nostr-ads/publisher-sdk

// Initialize the SDK with your API key
const NostrAds = require('@nostr-ads/publisher-sdk');
const client = new NostrAds({
  apiKey: '${apiKeyData.key}'
});

// Fetch and display an ad
const ad = await client.serveAd({
  placement: 'sidebar',
  format: 'image'
});

// Render the ad (example)
document.getElementById('ad-container').innerHTML = ad.html;`}
                  />
                </div>
              </div>
            )}
          </div>
        );
      
      case 'ad-slot-config':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Configure Ad Placements
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <Layout className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Ad Placements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Define where ads will appear on your site. Create distinct ad spaces for different sections of your content.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">Sidebar Ad</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Displayed in the right sidebar of blog posts</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-50 dark:text-green-300 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">Feed Post</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Native ad in the content feed</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                      Draft
                    </span>
                  </div>
                </div>
                
                <button className="w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                  <span className="text-xl">+</span>
                  <span>Add New Placement</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <Settings className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Ad Format & Style</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Choose how ads will look and behave on your site.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Text & Image</option>
                    <option>Text Only</option>
                    <option>Image Only</option>
                    <option>Rich Media</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Style
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Blended</option>
                    <option>Distinct</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'setup-wallet':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Connect Lightning Wallet
            </h3>
            
            <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important Information
                  </h4>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      You'll need a Lightning wallet to receive payments from advertisers. If you don't have one yet, we recommend creating one with
                      these trusted providers before continuing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <DollarSign className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Lightning Wallet Connection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Connect your Lightning wallet to receive satoshi payments from advertisers.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lightning Address
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="you@lightning.wallet"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This is the address where you'll receive payments from advertisers.
                  </p>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      id="testnet"
                      name="network"
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="testnet" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enable testnet for development
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col items-center">
                  <img src="https://cdn.jsdelivr.net/gh/lightning-digital-entertainment/icons@main/icons/walletofsatoshi_icon.png" alt="Wallet of Satoshi" className="h-12 w-12 mb-2" />
                  <span className="text-sm font-medium">Wallet of Satoshi</span>
                  <a href="https://www.walletofsatoshi.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Learn More
                  </a>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col items-center">
                  <img src="https://cdn.jsdelivr.net/gh/lightning-digital-entertainment/icons@main/icons/phoenix_icon.png" alt="Phoenix" className="h-12 w-12 mb-2" />
                  <span className="text-sm font-medium">Phoenix Wallet</span>
                  <a href="https://phoenix.acinq.co/" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Learn More
                  </a>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col items-center">
                  <img src="https://cdn.jsdelivr.net/gh/lightning-digital-entertainment/icons@main/icons/muun_icon.png" alt="Muun" className="h-12 w-12 mb-2" />
                  <span className="text-sm font-medium">Muun Wallet</span>
                  <a href="https://muun.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'enable-test-mode':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Test Your Integration
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <ToggleRight className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Test Mode</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Enable test mode to safely integrate and verify your ads are working correctly.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    id="testmode-toggle"
                    checked={enableTestMode}
                    onChange={() => setEnableTestMode(!enableTestMode)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition ${enableTestMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`transform transition-transform ${enableTestMode ? 'translate-x-6' : 'translate-x-1'} rounded-full h-4 w-4 bg-white mt-1`} />
                  </div>
                  <span className="ml-3 text-sm">
                    {enableTestMode ? 'Test mode enabled' : 'Test mode disabled'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <h5 className="font-medium">In test mode:</h5>
                  <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>No real money will be charged</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>You'll see test ads instead of real ones</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Test implementation without affecting your production site</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-3 rounded border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-300">
                  Once you're comfortable with your integration, disable test mode to start serving real ads and earning satoshis.
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <RefreshCw className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Test Your Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Verify your integration is working correctly with these test tools.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition-colors">
                  Run Integration Test
                </button>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  This will simulate ad requests and verify your setup is correct.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'go-live':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ready to Go Live
            </h3>
            
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                    You're all set!
                  </h4>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>
                      Your publisher account is ready to serve ads. You've successfully completed all onboarding steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <CheckCircle className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Onboarding Completed</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Here's a summary of your publisher setup.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Integration Method</span>
                      <span className="font-medium">{selectedIntegration === 'sdk' ? 'Server-Side SDK' : selectedIntegration === 'javascript' ? 'JavaScript SDK' : 'Simple Script Tag'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">API Key</span>
                      <span className="font-medium">•••••••••••••{apiKeyData.key ? apiKeyData.key.slice(-4) : '####'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Ad Placements</span>
                      <span className="font-medium">2 (Sidebar, Feed)</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Test Mode</span>
                      <span className="font-medium">{enableTestMode ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    You can manage your publisher settings, view analytics, and update your ad placements from your dashboard at any time.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">What's next?</p>
                  <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2">1</span>
                      <span>Review your ad placements in the dashboard</span>
                    </li>
                    <li className="flex items-center">
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2">2</span>
                      <span>Check your Lightning wallet connection</span>
                    </li>
                    <li className="flex items-center">
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2">3</span>
                      <span>Start earning satoshis as ads are displayed and clicked</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="publisher-onboarding">
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 pt-6">
            <div className="w-full">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Publisher Setup
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {currentStep === 'integration-details' ? 'Configure the details of your integration method.' :
                 currentStep === 'ad-slot-config' ? 'Define where and how ads will appear on your site.' :
                 currentStep === 'setup-wallet' ? 'Connect a Lightning wallet to receive payments.' :
                 currentStep === 'enable-test-mode' ? 'Test your integration in a safe environment.' :
                 'Final steps to go live with your ad integration.'}
              </p>
              {/* Progress bar is rendered in the OnboardingWizard component */}
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="py-6 text-center">
              {renderStepContent()}
            </div>
            
            {/* Navigation controls are handled in the parent OnboardingWizard component */}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PublisherOnboarding;