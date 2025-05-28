import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Code, DollarSign, Layout, Settings, CheckCircle, ToggleRight, Archive } from 'react-feather';
import ApiKeyBox from './ApiKeyBox';
import CodeSnippet from '@/components/ui/CodeSnippet';
import { SkipButton } from '@/components/ui/SkipButton';

interface ApiKeyData {
  id?: string;
  key: string;
  name: string;
  createdAt: string;
  scopes: string;
  isLoading: boolean;
  error: string | null;
}

interface PublisherOnboardingProps {
  currentStep: number;
  onComplete: () => void;
  skipOnboarding?: () => void;
}

const PublisherOnboarding: React.FC<PublisherOnboardingProps> = ({ 
  currentStep, 
  onComplete,
  skipOnboarding 
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('html');
  const [currentUserPubkey, setCurrentUserPubkey] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({
    key: '',
    name: '',
    createdAt: '',
    scopes: '',
    isLoading: false,
    error: null
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to get actual user pubkey from authentication context
        // For real publishers, we need authentic user identification
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          if (userData.pubkey) {
            setCurrentUserPubkey(userData.pubkey);
            return;
          }
        }
        
        // If no authenticated user, generate a temporary publisher ID
        // This will be replaced when the user properly authenticates
        const tempPubkey = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
        setCurrentUserPubkey(tempPubkey);
        console.log('Using temporary publisher ID for onboarding:', tempPubkey);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set a fallback pubkey with timestamp for uniqueness
        const fallbackPubkey = `pub_fallback_${Date.now()}`;
        setCurrentUserPubkey(fallbackPubkey);
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
  
  // Generate a real API key for actual publisher integration
  const generateRealApiKey = async (pubkey: string) => {
    setApiKeyData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('Generating real API key for publisher:', pubkey);
      
      // Make actual API call to generate real API key
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Publisher API Key',
          scopes: ['publisher:read', 'publisher:write', 'ad:serve'],
          type: 'publisher',
          pubkey: pubkey
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully generated real API key:', result.id);
      
      setApiKeyData({
        id: result.id,
        key: result.key,
        name: result.name || 'Publisher API Key',
        createdAt: result.createdAt || new Date().toISOString(),
        scopes: Array.isArray(result.scopes) ? result.scopes.join(', ') : result.scopes || 'publisher',
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error generating real API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate API key';
      
      setApiKeyData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
    }
  };

  // Refresh API key function
  const refreshApiKey = async () => {
    if (!currentUserPubkey) return;
    await generateRealApiKey(currentUserPubkey);
  };

  // Generate initial API key when step 3 is reached
  useEffect(() => {
    if (currentStep === 3 && selectedIntegration && currentUserPubkey) {
      generateRealApiKey(currentUserPubkey);
    }
  }, [currentStep, selectedIntegration, currentUserPubkey]);

  // Auto-generate API key if not already generated
  useEffect(() => {
    if (currentStep === 3 && currentUserPubkey && !apiKeyData.key && !apiKeyData.isLoading) {
      generateRealApiKey(currentUserPubkey);
    }
  }, [currentStep, currentUserPubkey, apiKeyData.key, apiKeyData.isLoading]);

  const getCodeSnippet = () => {
    if (selectedIntegration === 'html') {
      return `<!-- Nostr Ad Marketplace - HTML Integration -->
<div id="nostr-ad-slot" data-slot="banner" data-size="728x90">
  <!-- Ad will be loaded here -->
</div>

<script src="https://cdn.nostradmarketplace.com/ads.js"></script>
<script>
  NostrAds.init({
    apiKey: '${apiKeyData.key || 'YOUR_API_KEY'}',
    slots: ['#nostr-ad-slot']
  });
</script>`;
    } else if (selectedIntegration === 'javascript') {
      return `// Nostr Ad Marketplace - JavaScript Integration
import { NostrAdSDK } from '@nostr-ad-marketplace/sdk';

const adSDK = new NostrAdSDK({
  apiKey: '${apiKeyData.key || 'YOUR_API_KEY'}',
  environment: 'production'
});

// Load ad into specific container
adSDK.loadAd({
  container: '#ad-container',
  size: '728x90',
  placement: 'banner'
}).then(ad => {
  console.log('Ad loaded successfully', ad);
}).catch(error => {
  console.error('Failed to load ad', error);
});`;
    } else if (selectedIntegration === 'sdk') {
      return `// Nostr Ad Marketplace - Full SDK Integration
import { NostrAdMarketplace } from '@nostr-ad-marketplace/sdk';

const marketplace = new NostrAdMarketplace({
  apiKey: '${apiKeyData.key || 'YOUR_API_KEY'}',
  publisherSettings: {
    autoRefresh: true,
    refreshInterval: 30000,
    targeting: {
      categories: ['technology', 'bitcoin'],
      geography: 'global'
    }
  }
});

// Initialize multiple ad slots
marketplace.initializeSlots([
  { id: 'header-banner', size: '728x90' },
  { id: 'sidebar-ad', size: '300x250' },
  { id: 'content-ad', size: '320x50' }
]);

// Listen for ad events
marketplace.on('adLoaded', (event) => {
  console.log('Ad loaded:', event.slotId);
});

marketplace.on('adClicked', (event) => {
  console.log('Ad clicked:', event.slotId, event.revenue);
});`;
    }
    return '';
  };

  const renderIntegrationDetails = () => {
    if (!selectedIntegration) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integration Details</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please select an integration method from the previous step to continue.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedIntegration.charAt(0).toUpperCase() + selectedIntegration.slice(1)} Integration
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Copy and paste this code into your website to start displaying ads.
        </p>
        
        {skipOnboarding && (
          <div className="mb-8">
            <SkipButton onClick={skipOnboarding} />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">Integration Selected</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">API Key Generated</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready to Deploy</span>
          </div>
        </div>
        
        <CodeSnippet
          code={getCodeSnippet()}
          language={selectedIntegration === 'html' ? 'html' : 'javascript'}
          title={`${selectedIntegration.charAt(0).toUpperCase() + selectedIntegration.slice(1)} Integration Code`}
        />
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Installation Instructions</h3>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Copy the code snippet above</li>
            <li>2. Paste it into your website where you want ads to appear</li>
            <li>3. Replace 'YOUR_API_KEY' with your actual API key if not already done</li>
            <li>4. Test the integration to ensure ads load correctly</li>
            <li>5. Monitor your earnings in the publisher dashboard</li>
          </ol>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    
    // Convert string step names to numbers for the streamlined 5-step flow
    let stepNumber;
    if (typeof currentStep === 'string') {
      switch (currentStep) {
        case 'choose-integration':
          stepNumber = 1;
          break;
        case 'setup-configuration':
          stepNumber = 2;
          break;
        case 'api-key-testing':
          stepNumber = 3;
          break;
        case 'go-live':
          stepNumber = 4;
          break;
        case 'complete':
          stepNumber = 5;
          break;
        // Legacy step mapping for backward compatibility
        case 'integration-details':
        case 'ad-slot-config':
        case 'setup-wallet':
          stepNumber = 2; // Combined into setup-configuration
          break;
        case 'api-key':
        case 'enable-test-mode':
          stepNumber = 3; // Combined into api-key-testing
          break;
        default:
          stepNumber = 1; // Default to first step
      }
    } else {
      stepNumber = currentStep;
    }
    
    switch (stepNumber) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Integration</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select how you'd like to integrate ads into your website. You can always change this later.
            </p>
            
            <div className="space-y-4">
              <div 
                className={`cursor-pointer p-4 rounded border transition-colors ${
                  selectedIntegration === 'html' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
                onClick={() => setSelectedIntegration('html')}
              >
                <div className="flex items-center space-x-3">
                  <Code className="text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">HTML</span>
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
                  <span className="font-medium">SDK</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Full-featured SDK for complex integrations and custom solutions.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Setup & Configuration</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Configure your website details, ad placements, and payment settings.
            </p>
            
            {/* Website Information */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Website Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Gaming</option>
                    <option>News</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ad Slot Configuration */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ad Slot Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Ad Slot Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="header-banner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad Size
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>728x90 (Leaderboard)</option>
                    <option>300x250 (Medium Rectangle)</option>
                    <option>160x600 (Wide Skyscraper)</option>
                    <option>320x50 (Mobile Banner)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lightning Wallet Setup */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Setup</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Lightning wallet required for instant payments. Recommended: Alby or Phoenix wallet.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lightning Address (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="you@getalby.com"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Key & Testing</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Get your API key and test your integration before going live.
            </p>
            
            {/* API Key Section */}
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
                  <p className="mt-1">Using a fallback key based on your public key.</p>
                </div>
                <ApiKeyBox 
                  apiKey={apiKeyData.key} 
                  onRefresh={refreshApiKey}
                  isFallback={true}
                />
              </div>
            ) : apiKeyData.key ? (
              <ApiKeyBox 
                apiKey={apiKeyData.key} 
                onRefresh={refreshApiKey}
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">Click the button below to generate your API key.</p>
                <button 
                  onClick={() => generateRealApiKey(currentUserPubkey)}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Generate API Key
                </button>
              </div>
            )}
            
            {/* Test Mode Configuration */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Test Mode Benefits
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Test your integration with sample ads before going live. Verify everything works correctly without affecting real campaigns.
                  </p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable test mode for initial integration
                </span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Go Live</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You're ready to start earning with real ads!
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Integration Complete
                  </h3>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                    Your website is now ready to display ads and earn Lightning payments.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Next Steps</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Monitor your earnings in the Publisher Dashboard
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Optimize ad placements for better performance
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Access detailed analytics and reports
                </li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Publisher Setup Complete!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Congratulations! You're now ready to start earning with the Nostr Ad Marketplace.
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Check your dashboard for earnings and analytics</li>
                <li>• Fine-tune your ad placements for optimal performance</li>
                <li>• Explore advanced features and targeting options</li>
                <li>• Join our publisher community for tips and support</li>
              </ul>
            </div>
            
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium"
            >
              Go To Dashboard
            </button>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {renderStepContent()}
    </div>
  );
};

export default PublisherOnboarding;