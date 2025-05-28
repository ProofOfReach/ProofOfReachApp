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
        // Generate a demo pubkey for onboarding
        const demoPubkey = `demo_${Math.random().toString(36).substr(2, 16)}`;
        setCurrentUserPubkey(demoPubkey);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set a fallback pubkey for demo purposes
        setCurrentUserPubkey('demo_fallback_pubkey');
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
  
  // Generate a demo API key for the publisher onboarding experience
  const generateRealApiKey = async (pubkey: string) => {
    setApiKeyData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // For onboarding, generate a demo API key immediately
      // This will be replaced with a real API key after the user completes registration
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      const demoApiKey = `ak_demo_${Math.random().toString(36).substr(2, 16)}`;
      
      setApiKeyData({
        id: `demo_${Date.now()}`,
        key: demoApiKey,
        name: 'Demo Publisher API Key',
        createdAt: new Date().toISOString(),
        scopes: 'publisher:demo',
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error generating demo API key:', error);
      setApiKeyData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to generate demo API key' 
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
    if (!selectedIntegration) return null;

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
    switch (currentStep) {
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
        return renderIntegrationDetails();

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your API Key</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Here's your API key for accessing the Nostr Ad Marketplace. Keep this secure and never share it publicly.
            </p>
            
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Ad Slots</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Set up your ad placement preferences to maximize revenue while maintaining user experience.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <h3 className="font-medium mb-2">Header Banner</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Top of page placement for maximum visibility
                </p>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Enable header ads</span>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <h3 className="font-medium mb-2">Sidebar</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Sidebar placement for continuous visibility
                </p>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Enable sidebar ads</span>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <h3 className="font-medium mb-2">In-Content</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Ads within article content for high engagement
                </p>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Enable in-content ads</span>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <h3 className="font-medium mb-2">Footer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Bottom of page placement for additional revenue
                </p>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Enable footer ads</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Lightning Wallet</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Connect your Lightning wallet to receive instant payments for ad impressions and clicks.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex items-start">
                <DollarSign className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" size={18} />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Lightning Network Integration</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Lightning payments enable instant, low-fee Bitcoin transactions for your ad revenue.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <label className="block text-sm font-medium mb-2">Lightning Address</label>
                <input 
                  type="text" 
                  placeholder="your-wallet@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your Lightning address for receiving payments
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <label className="block text-sm font-medium mb-2">LNURL-Pay</label>
                <input 
                  type="text" 
                  placeholder="LNURL1DP68GURN8GHJ7..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Alternative: Paste your LNURL-Pay string
                </p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enable Test Mode</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Test your ad integration with sample ads before going live. This helps ensure everything works correctly.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-start">
                <Settings className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5" size={18} />
                <div>
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">Recommended: Test First</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    We recommend testing your integration before enabling live ads to ensure optimal performance.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input type="checkbox" className="mr-3" defaultChecked />
                <div>
                  <div className="font-medium">Enable Test Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Show sample ads to verify your integration works correctly
                  </div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input type="checkbox" className="mr-3" />
                <div>
                  <div className="font-medium">Email Test Reports</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive daily reports during test period
                  </div>
                </div>
              </label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Go Live</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You're ready to start earning! Enable live ads to begin receiving real advertisers and payments.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex items-start">
                <CheckCircle className="text-green-600 dark:text-green-400 mr-3 mt-0.5" size={18} />
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">Setup Complete</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your publisher account is configured and ready to go live.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded">
                <div>
                  <div className="font-medium">Enable Live Ads</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Start showing real ads and earning revenue
                  </div>
                </div>
                <ToggleRight className="text-green-600 dark:text-green-400" size={24} />
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
                <h3 className="font-medium mb-2">Next Steps</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Monitor your earnings in the dashboard</li>
                  <li>• Optimize ad placements for better performance</li>
                  <li>• Set up additional ad slots as needed</li>
                  <li>• Review analytics and adjust targeting</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
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