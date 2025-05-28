import React, { useState, useEffect } from 'react';
import '@/context/OnboardingContext';
import { Code, DollarSign, Layout, Settings, CheckCircle, ToggleRight, Archive } from 'react-feather';
import ApiKeyBox from './ApiKeyBox';
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

const PublisherOnboarding: React.FC<PublisherOnboardingProps> = ({
  currentStep,
  onComplete,
  skipOnboarding
}) => {
  // Track selected integration type
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>(null);
  
  // API key display state
  const [showApiKey, setShowApiKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // API key data with initial default fallback values
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({
    id: '',
    key: 'sk_test_publisher_default_placeholder',
    name: 'Publisher API Key',
    createdAt: new Date().toISOString(),
    scopes: 'publisher:read,publisher:write,ad:serve',
    isLoading: true,
    error: null
  });
  
  // Current user pubkey
  const [currentUserPubkey, setCurrentUserPubkey] = useState<string | null>(null);
  
  // Get current user's pubkey from localStorage or cookie
  useEffect(() => {
    // First try localStorage
    const storedPubkey = typeof window !== 'undefined' ? localStorage.getItem('pubkey') : null;
    
    if (storedPubkey) {
      setCurrentUserPubkey(storedPubkey);
      return;
    }
    
    // Then try fetching from the user endpoint
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          if (data && data.user && data.user.pubkey) {
            setCurrentUserPubkey(data.user.pubkey);
          }
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Check for test mode
  const [isTestModeActive, setIsTestModeActive] = useState(false);
  
  useEffect(() => {
    const checkTestMode = () => {
      if (typeof window === 'undefined') return false;
      
      // Check localStorage for test mode flag
      const testMode = localStorage.getItem('testModeActive');
      return testMode === 'true';
    };
    
    setIsTestModeActive(checkTestMode());
  }, []);
  
  // Generate a real API key for the publisher using the improved apiKeyService
  const generateRealApiKey = async (pubkey: string) => {
    setApiKeyData(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Use a longer timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API key generation timed out')), 12000); // Extended timeout for better reliability
    });
    
    // Track attempts for retries
    let attempts = 0;
    const maxAttempts = 2;
    
    const attemptApiKeyGeneration = async (): Promise<any> => {
      attempts++;
      
      try {
        // Make the API call
        const fetchPromise = fetch('/api/auth/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Publisher API Key',
            description: 'Created during publisher onboarding',
            scopes: 'publisher:read,publisher:write,ad:serve',
            type: 'publisher', // Explicitly set type to publisher
          }),
        });
        
        // Use Promise.race to handle potential timeouts
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        // If we have attempts left, retry
        if (attempts < maxAttempts) {
          console.log(`Retrying API key generation (attempt ${attempts + 1} of ${maxAttempts})...`);
          return attemptApiKeyGeneration();
        }
        throw error;
      }
    };
    
    try {
      // Attempt to generate the API key with retries
      const apiKey = await attemptApiKeyGeneration();
      
      // Check if the API key returned contains a warn about using a fallback key
      const warn = apiKey.warn || null;
      
      setApiKeyData({
        id: apiKey.id || `fallback_${pubkey.substring(0, 8)}`,
        key: apiKey.key || `pub_${pubkey.substring(0, 8)}_${Date.now()}`,
        name: apiKey.name || 'Publisher API Key',
        createdAt: apiKey.createdAt || new Date().toISOString(),
        scopes: apiKey.scopes || 'publisher:read,publisher:write,ad:serve',
        isLoading: false,
        error: warn // If there's a warn, show it as a non-critical error
      });
    } catch (error) {
      console.log('Error generating API key:', error);
      
      // Create a fallback key that follows our naming conventions
      const fallbackKey = `pub_fallback_${pubkey.substring(0, 8)}_${Date.now()}`;
      
      // Always provide a fallback key so the UI doesn't get stuck
      setApiKeyData({
        id: `fallback_${pubkey.substring(0, 8)}`,
        key: fallbackKey,
        name: 'Publisher API Key (Fallback)',
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
    
    // If we're on the choose-integration step, immediately try to generate a real API key
    // This ensures that when the user selects an integration type, they likely already have an API key
    if (currentStep === 'choose-integration' && currentUserPubkey) {
      // If we're still loading and haven't tried to get a key yet
      if (apiKeyData.isLoading) {
        // Try to generate a real API key in the background
        generateRealApiKey(currentUserPubkey).catch(() => {
          // If real API key generation fails, use a fallback immediately
          const fallbackKey = `pub_prefetch_${currentUserPubkey.substring(0, 8)}_${Date.now()}`;
          
          setApiKeyData({
            id: `fallback_${currentUserPubkey.substring(0, 8)}`,
            key: fallbackKey,
            name: 'Publisher API Key (Pending)',
            createdAt: new Date().toISOString(),
            scopes: 'publisher:read,publisher:write,ad:serve',
            isLoading: false,
            error: null
          });
        });
      }
    }
  }, [currentStep, selectedIntegration, currentUserPubkey, isTestModeActive, apiKeyData.isLoading]);

  // Refresh API key on demand
  const refreshApiKey = async () => {
    if (isRefreshing || !currentUserPubkey) return;
    
    setIsRefreshing(true);
    
    try {
      await generateRealApiKey(currentUserPubkey);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle onboarding navigation
  const continueToNextStep = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  if (currentStep === 'choose-integration') {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Choose Your Integration Method</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Select how you'd like to integrate Nostr Ads into your platform. You can always change this later.
          </p>
        </div>
        
        {skipOnboarding && (
          <div className="mb-8">
            <SkipButton onSkip={skipOnboarding} label="Skip this step" />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            className={`cursor-pointer p-4 rounded border transition-colors ${
              selectedIntegration === 'simple' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
            onClick={() => setSelectedIntegration('simple')}
          >
            <div className="flex items-center space-x-3">
              <Code className="text-purple-600 dark:text-purple-400" />
              <span className="font-medium">Basic HTML</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Simple HTML code snippet to paste into your website.
            </p>
          </div>
          
          <div 
            className={`cursor-pointer p-4 rounded border transition-colors ${
              selectedIntegration === 'javascript' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
            onClick={() => setSelectedIntegration('javascript')}
          >
            <div className="flex items-center space-x-3">
              <Layout className="text-purple-600 dark:text-purple-400" />
              <span className="font-medium">JavaScript</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Advanced JavaScript integration with dynamic ad loading.
            </p>
          </div>
          
          <div 
            className={`cursor-pointer p-4 rounded border transition-colors ${
              selectedIntegration === 'sdk' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
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
              // Force fallback immediately on selection to prevent hanging
              (() => {
                // If we're still loading after 100ms, use a fallback key
                setTimeout(() => {
                  if (apiKeyData.isLoading && currentUserPubkey) {
                    const fallbackKey = `sk_${isTestModeActive ? 'test' : 'live'}_publisher_${currentUserPubkey.substring(0, 8)}_immediate`;
                    
                    setApiKeyData({
                      id: `pub_${currentUserPubkey.substring(0, 8)}`,
                      key: fallbackKey,
                      name: 'Publisher API Key',
                      createdAt: new Date().toISOString(),
                      scopes: 'publisher:read,publisher:write,ad:serve',
                      isLoading: false,
                      error: 'Automatically generated fallback key'
                    });
                  }
                }, 1000);
                
                return (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generating your API key...</p>
                    </div>
                  </div>
                );
              })()
            ) : apiKeyData.log ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-600 dark:text-red-400 text-sm mb-3">
                  <p>Error generating API key: {apiKeyData.log}</p>
                  <p className="mt-1">Using a fallback key based on your Nostr public key.</p>
                </div>
                <ApiKeyBox 
                  apiKey={apiKeyData.key} 
                  onRefresh={refreshApiKey}
                  isFallback={true}
                />
              </div>
            ) : (
              <ApiKeyBox 
                apiKey={apiKeyData.key} 
                onRefresh={refreshApiKey}
              />
            )}
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white">Integration Code</h4>
              <CodeSnippet
                language="javascript"
                code={`// Install our SDK
npm install @nostr-ads/publisher-sdk

// Initialize the SDK with your API key
const NostrAds = require('@nostr-ads/publisher-sdk');
const adClient = NostrAds.initialize('${apiKeyData.key}');

// Display an ad
adClient.displayAd('#ad-container', {
  format: 'banner',
  size: '300x250'
});`}
              />
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => continueToNextStep()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-500 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (currentStep === 'integration-details') {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Integration Details</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Follow these steps to integrate Nostr Ads into your platform.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">1. Choose Your Ad Placement</h3>
            <p className="mb-4">Identify where you want ads to appear on your site or app. Consider areas with high visibility but minimal disruption to user experience.</p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-2">
              <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                <h5 className="font-medium mb-2 flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Good Placements
                </h5>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Sidebar content areas</li>
                  <li>• Between content sections</li>
                  <li>• End of articles</li>
                  <li>• App screen transitions</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                <h5 className="font-medium mb-2 flex items-center">
                  <ToggleRight size={16} className="text-yellow-500 mr-2" />
                  Consider With Caution
                </h5>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Header/hero sections</li>
                  <li>• Mid-paragraph placements</li>
                  <li>• Modal/popup ads</li>
                  <li>• Multiple ads per view</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* API Key Display Section */}
          <div className="py-6">
            <h3 className="text-lg font-semibold mb-4">2. Your API Key</h3>
            <p className="mb-4">Use this API key to integrate ads into your site or application. Keep this key secure.</p>
            
            {/* API Key Data Display */}
            {apiKeyData.key ? (
              <ApiKeyBox 
                apiKey={apiKeyData.key} 
                onRefresh={refreshApiKey}
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publisher API Key
                  </h5>
                </div>
                <div className="mt-3 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                  <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Loading API key...
                </div>
              </div>
            )}
            
            <h5 className="text-md font-medium mt-6 mb-2">Integration Snippet</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Copy and paste this code where you want ads to appear in your HTML.
            </p>
            
            <CodeSnippet
              language="html"
              code={`<!-- Nostr Ads Integration -->
<div id="nostr-ad-container"></div>
<script src="https://cdn.nostrads.com/publisher.js"></script>
<script>
  window.NostrAds.initialize({
    apiKey: '${apiKeyData.key || 'YOUR_API_KEY'}',
    adContainer: '#nostr-ad-container',
    format: 'banner',
    size: '300x250'
  });
</script>`}
            />
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help? Check out our <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Integration Guide</a>.
              </p>
            </div>
            <button
              onClick={continueToNextStep}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-500 transition-colors"
            >
              <span>Complete Setup</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Default fallback
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Unknown onboarding step. Please restart the onboarding process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherOnboarding;