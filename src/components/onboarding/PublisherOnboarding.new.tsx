import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Code, DollarSign, Layout, Settings, CheckCircle, ToggleRight, Archive, Copy, RefreshCw } from 'react-feather';
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
  
  // State for API key
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({
    id: '',
    key: '',
    name: '',
    createdAt: '',
    scopes: '',
    isLoading: false,
    error: null
  });
  
  // Function to generate a new API key
  const generateApiKey = async () => {
    setApiKeyData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // In a real production environment, this should come from the API
      // For onboarding demonstration purposes, we'll use a simulated key
      // until the user has completed registration and can create real keys
      const generatedKey = 'ak_' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
      
      // Set a timeout to simulate network request
      setTimeout(() => {
        setApiKeyData({
          id: Math.random().toString(16).slice(2, 10),
          key: generatedKey,
          name: 'Default Publisher Key',
          createdAt: new Date().toISOString(),
          scopes: 'publisher',
          isLoading: false,
          error: null
        });
      }, 800);
    } catch (error) {
      setApiKeyData(prev => ({ ...prev, isLoading: false, error: 'Failed to generate API key' }));
    }
  };
  
  // Generate API key on initial render for create-api-key step
  useEffect(() => {
    if (currentStep === 'create-api-key') {
      generateApiKey();
    }
  }, [currentStep]);
  
  // Custom component for different integration options
  const IntegrationOption = ({ title, icon, description, id }: { 
    title: string; 
    icon: React.ReactNode; 
    description: string;
    id: IntegrationType;
  }) => (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selectedIntegration === id 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-10' 
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
      }`}
      onClick={() => {
        console.log('Selected integration method:', id);
        setSelectedIntegration(id);
      }}
    >
      <div className="flex items-center mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
          selectedIntegration === id 
            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:bg-opacity-50 dark:text-purple-300' 
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">{description}</p>
    </div>
  );
  
  // Content based on the current step
  switch (currentStep) {
    case 'role-selection':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-grow">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Welcome to the Publisher Onboarding</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Get started with monetizing your content through the Nostr Ad Marketplace
              </p>
            </div>
            <SkipButton 
              onSkip={handleSkip}
              testId="publisher-skip-button"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">What You'll Need:</h3>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">
                  <CheckCircle size={18} />
                </span>
                <span className="text-gray-700 dark:text-gray-300">A Nostr account (which you already have)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">
                  <CheckCircle size={18} />
                </span>
                <span className="text-gray-700 dark:text-gray-300">Your website or application where you'll display ads</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">
                  <CheckCircle size={18} />
                </span>
                <span className="text-gray-700 dark:text-gray-300">A basic understanding of HTML/JavaScript</span>
              </li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">What You'll Be Able To Do:</h3>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2 mt-0.5">
                  <DollarSign size={18} />
                </span>
                <span className="text-gray-700 dark:text-gray-300">Earn Bitcoin from ad impressions and clicks</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2 mt-0.5">
                  <Layout size={18} />
                </span>
                <span className="text-gray-700 dark:text-gray-300">Customize ad placements on your website</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2 mt-0.5">
                  <Settings size={18} />
                </span>
                <span className="text-gray-700 dark:text-gray-300">Configure content-appropriate ads for your audience</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2 mt-0.5">
                  <ToggleRight size={18} />
                </span>
                <span className="text-gray-700 dark:text-gray-300">Full control over what types of ads are displayed</span>
              </li>
            </ul>
            
            {/* Navigation buttons are now in the shared OnboardingWizard component */}
          </div>
        </div>
      );
      
    case 'choose-integration':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Publisher Implementation</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Choose an implementation method and get your API key to start displaying ads.
              </p>
            </div>
            <SkipButton 
              onSkip={handleSkip}
              testId="publisher-skip-button"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Publisher API Key</h3>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-4">
                {apiKeyData.isLoading ? (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="animate-spin mr-2"><RefreshCw size={16} /></span>
                    Generating your API key...
                  </div>
                ) : apiKeyData.error ? (
                  <div className="text-red-500 text-sm">
                    {apiKeyData.error}
                    <button 
                      onClick={generateApiKey}
                      className="ml-2 underline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">API Key</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(apiKeyData.key);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                      >
                        <Copy size={12} className="mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 break-all">
                      {apiKeyData.key}
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {apiKeyData.key ? 
                  "Keep this key secure. You can always find and manage your API keys in the Developer section of your dashboard." :
                  "An API key will be automatically generated for you to use with the JavaScript API."}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Choose Your Integration Method</h3>
              
              <div className="space-y-4">
                <IntegrationOption 
                  id="simple"
                  title="Simple HTML Embed" 
                  icon={<Code size={18} />}
                  description="Just copy and paste HTML code - no programming required." 
                />
                
                <IntegrationOption 
                  id="javascript"
                  title="JavaScript Integration" 
                  icon={<Code size={18} />}
                  description="For more control over ad placement and display." 
                />
                
                <IntegrationOption 
                  id="sdk"
                  title="SDK Integration" 
                  icon={<Archive size={18} />}
                  description="Advanced integration with our SDK for full customization." 
                />
              </div>
            </div>
            
            {selectedIntegration && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {selectedIntegration === 'simple' ? 'Simple HTML Embed Instructions' :
                    selectedIntegration === 'javascript' ? 'JavaScript Integration Instructions' :
                    'SDK Integration Instructions'}
                </h3>
                
                {selectedIntegration === 'simple' && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Copy and paste this code snippet where you want the ad to appear:
                    </p>
                    
                    <CodeSnippet
                      language="html"
                      code={`<!-- Nostr Ad Marketplace Integration -->
<div id="nostr-ad-container" style="width: 100%; min-height: 250px;"></div>
<script src="https://cdn.nostrads.org/simple.js"></script>
<script>
  // Load config from secure backend endpoint
  fetch('/api/publisher/config')
    .then(response => response.json())
    .then(config => {
      window.NostrAds.init({
        containerSelector: '#nostr-ad-container',
        publisherId: config.publisherId, // Use publisher ID instead of API key
        placement: 'content-feed' // Options: content-feed, banner, sidebar
      });
    })
    .catch(error => {
      console.error('Failed to load publisher config:', error);
    });
</script>`}
                    />
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Placement Options:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">content-feed</code> - Native ads within your content</li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">banner</code> - Horizontal banner ads</li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">sidebar</code> - Vertical ads for sidebars</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {selectedIntegration === 'javascript' && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      For more control, use our JavaScript API:
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Step 1: Create your backend configuration endpoint</h4>
                      </div>
                      <CodeSnippet 
                        language="javascript"
                        title="Backend Configuration Endpoint"
                        code={`// File: /pages/api/publisher/config.js
import { getServerSession } from "next-auth/next";
import { prisma } from "../../../lib/prismaClient";

export default async function handler(req, res) {
  // Verify the publisher is authenticated
  const session = await getServerSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Get the publisher's API key from database
  const apiKey = await prisma.apiKey.findFirst({
    where: { 
      userId: session.user.id,
      isActive: true 
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!apiKey) {
    return res.status(404).json({ error: "No API key found" });
  }
  
  // Return publisher configuration
  return res.status(200).json({
    apiKey: apiKey.key,
    defaultPlacement: 'feed',
    publisherId: session.user.id,
    // Add any other publisher-specific configuration here
  });
}`}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Step 2: Include the JavaScript client</h4>
                      </div>
                      <CodeSnippet 
                        language="javascript"
                        title="JavaScript Integration"
                        code={`// Add to your page or component
import { useEffect } from 'react';

function AdContainer() {
  useEffect(() => {
    // 1. Load the Nostr Ad Marketplace SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.nostrads.org/client.js';
    script.async = true;
    document.body.appendChild(script);
    
    // 2. Initialize when script loads
    script.onload = async () => {
      try {
        // Get configuration from your secured endpoint
        const response = await fetch('/api/publisher/config');
        const config = await response.json();
        
        // Initialize the client
        window.NostrAds.init({
          apiKey: config.apiKey, // Use from secured endpoint
          placement: 'sidebar',
          theme: 'light', // or 'dark', 'auto'
          interests: ['technology', 'bitcoin', 'privacy'],
          adCount: 2, // Number of ads to show
          refreshInterval: 60, // Seconds between ad refreshes
          onAdDisplay: (adData) => {
            console.log('Ad displayed:', adData.id);
          },
          onAdClick: (adData) => {
            console.log('Ad clicked:', adData.id);
          }
        });
        
        // Render ads in container
        window.NostrAds.render('#ad-container');
      } catch (error) {
        console.error('Failed to initialize ad client:', error);
      }
    };
    
    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <div id="ad-container" className="w-full min-h-[250px] bg-gray-50 dark:bg-gray-800 rounded">
      <p className="text-center p-4 text-gray-400">Ad Loading...</p>
    </div>
  );
}`}
                      />
                    </div>
                  </div>
                )}
                
                {selectedIntegration === 'sdk' && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      For advanced integration, install our NPM package:
                    </p>
                    
                    <CodeSnippet
                      language="bash"
                      title="Installation"
                      code="npm install @nostr-ads/sdk"
                    />
                    
                    <div className="mt-4 mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">SDK Usage:</h4>
                      <CodeSnippet
                        language="javascript"
                        title="SDK Integration"
                        code={`// Import the SDK
import { NostrAdMarketplaceSDK } from '@nostr-ads/sdk';

// Initialize the SDK with your API key
const nostrAdSDK = new NostrAdMarketplaceSDK({
  apiKey: process.env.NOSTR_ADS_API_KEY, // Store securely in environment variables
  debug: process.env.NODE_ENV === 'development'
});

// Example: Serve an ad
async function serveAdExample() {
  try {
    const ad = await nostrAdSDK.serveAd({
      placement: 'feed',
      format: 'text-image',
      interests: ['technology', 'bitcoin', 'privacy'],
      pubkey: '${apiKeyData.key || 'YOUR_PUBLISHER_PUBKEY'}' // Your Nostr public key
    });
    
    if (ad) {
      // Render the ad using your preferred UI components
      renderAd(ad);
    } else {
      console.log('No suitable ad available');
    }
  } catch (error) {
    console.error('Error serving ad:', error);
  }
}

// Example: Track a click
function trackClickExample(adId) {
  nostrAdSDK.trackClick({
    adId: adId,
    placement: 'feed',
    pubkey: '${apiKeyData.key || 'YOUR_PUBLISHER_PUBKEY'}' // Your Nostr public key
  });
}

// Example: Get publisher stats
async function getStatsExample() {
  try {
    const stats = await nostrAdSDK.fetchPublisherStats({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });
    
    console.log('Impressions:', stats.impressions);
    console.log('Clicks:', stats.clicks);
    console.log('CTR:', stats.ctr);
    console.log('Earnings:', stats.earnings);
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}`}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Check out the <a href="#" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300">complete SDK documentation</a> for more features and examples.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
      
    case 'create-api-key':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStep === 'integration-details' ? 'Integration Details' :
                 currentStep === 'ad-slot-config' ? 'Configure Ad Slots' :
                 currentStep === 'setup-wallet' ? 'Setup Payment Wallet' :
                 currentStep === 'enable-test-mode' ? 'Test Your Integration' :
                 'Go Live with Ads'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStep === 'integration-details' ? 'Configure the details of your integration method.' :
                 currentStep === 'ad-slot-config' ? 'Define where and how ads will appear on your site.' :
                 currentStep === 'setup-wallet' ? 'Connect a Lightning wallet to receive payments.' :
                 currentStep === 'enable-test-mode' ? 'Test your integration in a safe environment.' :
                 'Final steps to go live with your ad integration.'}
              </p>
            </div>
            <SkipButton 
              onSkip={handleSkip}
              testId="publisher-skip-button"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Publisher API Key</h3>
              
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-4">
                {apiKeyData.isLoading ? (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="animate-spin mr-2"><RefreshCw size={16} /></span>
                    Generating your API key...
                  </div>
                ) : apiKeyData.error ? (
                  <div className="text-red-500 text-sm">
                    {apiKeyData.error}
                    <button 
                      onClick={generateApiKey}
                      className="ml-2 underline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">API Key</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(apiKeyData.key);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                      >
                        <Copy size={12} className="mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 break-all">
                      {apiKeyData.key}
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Keep this API key secure. You'll need it to authenticate your requests to the Nostr Ad Marketplace.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-3 rounded-md border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> Store your API key securely and never expose it in client-side code. Always use a backend service to make authenticated API calls.
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">API Key Permissions</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-2 rounded-full text-green-600 dark:text-green-300 mr-3 flex-shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Serve Ads</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This API key can be used to request and serve ads on your platform.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-2 rounded-full text-green-600 dark:text-green-300 mr-3 flex-shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Track Impressions & Clicks</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically tracks ad impressions and clicks for payment calculations.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-2 rounded-full text-green-600 dark:text-green-300 mr-3 flex-shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Access Publisher Analytics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View detailed analytics about ad performance on your platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case 'ad-slot-config':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Configure Ad Slots</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Define where and how ads will appear on your platform.
              </p>
            </div>
            <SkipButton 
              onSkip={handleSkip}
              testId="publisher-skip-button"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ad slots are specific locations on your website or application where ads will be displayed. 
              Configure your slots to optimize visibility and engagement.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sample Ad Slot Configurations</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white">Banner Ad Slot</h4>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-md h-16 flex items-center justify-center mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Banner Ad Preview (728×90)</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placement ID</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          banner-top
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Format</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          Banner (728×90)
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refresh Rate</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          60 seconds
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Categories</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          Tech, Bitcoin, Privacy
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white">Feed Ad Slot</h4>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-md h-28 flex items-center justify-center mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Native Feed Ad Preview</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placement ID</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          content-feed
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Format</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          Native Feed (Text + Image)
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          Every 5th post
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Categories</label>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          Bitcoin, Technology, Education
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Integration Code Example</h3>
              
              <CodeSnippet
                language="javascript"
                code={`// Example: Configure multiple ad slots
const nostrAds = new NostrAdMarketplace({
  apiKey: 'YOUR_API_KEY', // Use from secured backend
  pubkey: 'YOUR_PUBLISHER_PUBKEY', // Your Nostr public key
});

// Banner ad slot
nostrAds.createSlot({
  id: 'banner-top',
  container: '#top-banner',
  format: 'banner',
  size: '728x90',
  refreshInterval: 60, // seconds
  categories: ['tech', 'bitcoin', 'privacy'],
  onAdDisplay: (adData) => {
    console.log('Banner ad displayed:', adData.id);
  }
});

// Native feed ad slot
nostrAds.createSlot({
  id: 'content-feed',
  container: '.feed-container',
  format: 'native',
  position: 'every-5', // Show ad every 5 posts
  template: 'feed-item', // Custom template ID
  categories: ['bitcoin', 'technology', 'education'],
  onAdClick: (adData) => {
    console.log('Feed ad clicked:', adData.id);
  }
});

// Start loading ads
nostrAds.loadAds();`}
              />
            </div>
          </div>
        </div>
      );
      
    case 'setup-wallet':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Setup Payment Wallet</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Connect a Lightning wallet to receive ad revenue payments.
              </p>
            </div>
            <SkipButton 
              onSkip={handleSkip}
              testId="publisher-skip-button"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The Nostr Ad Marketplace uses Bitcoin Lightning Network for payments. 
              Connect your Lightning wallet to receive your ad revenue automatically.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Connect Lightning Wallet</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">Lightning Address</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enter your Lightning address to receive payments</p>
                  </div>
                  <div className="ml-4">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
                      Connect
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">LNURL</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect using LNURL from your Lightning wallet</p>
                  </div>
                  <div className="ml-4">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
                      Generate
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center">
                  <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">Static Invoice</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set up a static Lightning invoice for payments</p>
                  </div>
                  <div className="ml-4">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
                      Setup
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Schedule</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Daily Micropayments</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive lightning micropayments for ad impressions and clicks daily.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Detailed Reports</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Access detailed payment reports with impression and click details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Flexible Withdrawal Options</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose between automatic payments or manual withdrawals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case 'setup-complete':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Publisher Setup Complete!</h2>
              <p className="text-gray-600 dark:text-gray-300">
                You've successfully set up your publisher account and are ready to start monetizing.
              </p>
            </div>
            <SkipButton 
              onSkip={handleSkip}
              testId="publisher-skip-button"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Next Steps</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3">
                  <Code size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Implement Your Ad Placements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the SDK or integration guide to add ad placements to your site.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Test Your Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use test mode to verify ads are displaying correctly on your site.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Monitor Performance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track your ad performance and earnings in the publisher dashboard.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Get Paid in Bitcoin</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive automatic payments via the Lightning Network.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Documentation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Complete guides and API reference for publishers.
                  </p>
                  <a href="#" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium">
                    Read Documentation →
                  </a>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sample Code</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Download example implementation code for common platforms.
                  </p>
                  <a href="#" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium">
                    Get Code Samples →
                  </a>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Publisher Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Access your analytics, earnings, and account settings.
                  </p>
                  <a href="#" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium">
                    Go to Dashboard →
                  </a>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Get help with your integration or ask questions.
                  </p>
                  <a href="#" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium">
                    Contact Support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="max-w-2xl mx-auto py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Unknown step: {currentStep}
          </p>
          <div className="mt-4 flex justify-center">
            <button 
              onClick={onComplete}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
  }
});

export default PublisherOnboarding;