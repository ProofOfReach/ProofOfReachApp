import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Code, DollarSign, Layout, Settings, CheckCircle, ToggleRight, Archive, Copy, RefreshCw } from 'react-feather';
import CodeSnippet from '@/components/ui/CodeSnippet';

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
const PublisherOnboarding: React.FC<PublisherOnboardingProps> = React.memo(({ currentStep, skipOnboarding }) => {
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
  
  // Generate API key on initial render
  useEffect(() => {
    if (currentStep === 'setup') {
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
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Welcome to the Publisher Onboarding</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Get started with monetizing your content through the Nostr Ad Marketplace
            </p>
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
            
            <div className="mt-8 flex justify-between">
              {skipOnboarding && (
                <button
                  type="button"
                  onClick={skipOnboarding}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Skip For Now
                </button>
              )}
              <button 
                className="ml-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                data-testid="publisher-next-button"
                onClick={() => {
                  // Proceed to implementation step
                }}
              >
                Let's Get Started →
              </button>
            </div>
          </div>
        </div>
      );
      
    case 'choose-integration':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Publisher Implementation</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose an implementation method and get your API key to start displaying ads.
            </p>
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
  window.NostrAds.init({
    containerSelector: '#nostr-ad-container',
    publisherKey: '${apiKeyData.key || 'YOUR_PUBLISHER_API_KEY'}',
    placement: 'content-feed' // Options: content-feed, banner, sidebar
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
    publisherId: session.user.id
  });
}`}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Step 2: Client-Side Implementation</h4>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>HTML/JavaScript • Client Implementation</span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Working Example</span>
                        </div>
                        <CodeSnippet
                          language="html"
                          code={`<!-- File: index.html -->
<!-- Include the Nostr Ads JavaScript API -->
<script src="https://cdn.nostrads.org/sdk/v1/nostr-ads.js"></script>

<script>
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Load configuration from your backend
    const response = await fetch('/api/publisher/config');
    
    if (!response.ok) {
      throw new Error('Failed to load publisher configuration');
    }
    
    const config = await response.json();
    
    // Initialize with configuration from your backend
    NostrAds.init({
      publisherId: config.publisherId,
      defaultPlacement: config.defaultPlacement
    });
    
    // Create ad placements
    NostrAds.createAdPlacement('sidebar-ad');
  } catch (error) {
    console.error('Failed to initialize Nostr Ads:', error);
    
    // Show fallback content
    document.querySelectorAll('.nostr-ad-container').forEach(container => {
      container.innerHTML = '<p>Ad content temporarily unavailable</p>';
    });
  }
});
</script>

<!-- HTML placement for ads -->
<div id="sidebar-ad" class="nostr-ad-container"></div>`}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Secure Server-Side Tracking</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Set up proper click tracking with server-side API:
                      </p>
                      
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>JavaScript • Server-Side Tracking</span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Working Example</span>
                        </div>
                        <CodeSnippet
                          language="javascript"
                          code={`// File: /pages/api/publisher/track-click.js
export default async function handler(req, res) {
  const { adId } = req.query;
  
  if (!adId) {
    return res.status(400).json({ error: "Ad ID is required" });
  }
  
  try {
    // Securely track clicks server-side
    // Using environment variables - never expose API keys client-side
    const trackResponse = await fetch(
      \`https://api.nostrads.org/v1/ads/\${adId}/click\`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NOSTR_ADS_API_KEY  // Secure: Uses server environment
        },
        body: JSON.stringify({
          publisherId: process.env.PUBLISHER_ID,
          timestamp: new Date().toISOString()
        })
      }
    );
    
    if (!trackResponse.ok) {
      throw new Error('Failed to track click');
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return res.status(500).json({ error: 'Failed to track click' });
  }
}`}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedIntegration === 'sdk' && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      For the most flexible integration, use our SDK:
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Step 1: Install the SDK</h4>
                      <CodeSnippet
                        language="bash"
                        code={`# Using npm
npm install @nostr/ad-marketplace

# Using yarn
yarn add @nostr/ad-marketplace`}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Step 2: Initialize the SDK</h4>
                      <CodeSnippet
                        language="javascript"
                        code={`// Import the SDK
import { NostrAdMarketplace } from '@nostr/ad-marketplace';

// Initialize with your publisher key
const adMarketplace = new NostrAdMarketplace({
  apiKey: '${apiKeyData.key || 'YOUR_PUBLISHER_API_KEY'}',
  defaultPlacement: 'content',
  debug: process.env.NODE_ENV === 'development'
});

// Load an ad
async function loadAd(placementId, targetElement) {
  try {
    const ad = await adMarketplace.getAd({
      placementId,
      contentCategories: ['technology', 'bitcoin']
    });
    
    if (ad) {
      // Render the ad
      const adElement = document.createElement('div');
      adElement.className = 'nostr-ad';
      adElement.innerHTML = \`
        <a href="\${ad.targetUrl}" class="nostr-ad-link" data-ad-id="\${ad.id}">
          <div class="nostr-ad-content">
            <img src="\${ad.imageUrl}" alt="\${ad.title}" class="nostr-ad-image">
            <div class="nostr-ad-text">
              <h3 class="nostr-ad-title">\${ad.title}</h3>
              <p class="nostr-ad-description">\${ad.description}</p>
            </div>
          </div>
        </a>
      \`;
      
      // Add click tracking
      adElement.querySelector('.nostr-ad-link').addEventListener('click', (e) => {
        e.preventDefault();
        
        // Track the click
        adMarketplace.trackClick({
          adId: ad.id,
          placementId
        });
        
        // Navigate to the target URL
        window.open(ad.targetUrl, '_blank');
      });
      
      // Add the ad to the target element
      targetElement.appendChild(adElement);
    }
  } catch (error) {
    console.error('Failed to load ad:', error);
  }
}`}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Step 3: Add CSS Styling</h4>
                      <CodeSnippet
                        language="css"
                        code={`.nostr-ad {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.nostr-ad:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.nostr-ad-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.nostr-ad-content {
  display: flex;
  padding: 1rem;
}

.nostr-ad-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.25rem;
  margin-right: 1rem;
}

.nostr-ad-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.nostr-ad-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
}`}
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Testing Your Integration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Once you've implemented the code, you can verify it's working by:
                  </p>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal pl-5 space-y-2">
                    <li>Checking your browser console for any errors</li>
                    <li>Verifying the ad container is visible and properly styled</li>
                    <li>Testing clicks to ensure they are properly tracked</li>
                    <li>Viewing your publisher dashboard to see impression and click data</li>
                  </ol>
                </div>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
              {skipOnboarding && (
                <button
                  type="button"
                  onClick={skipOnboarding}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Skip For Now
                </button>
              )}
              <button
                className="ml-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors" 
                data-testid="publisher-next-button"
                onClick={() => {
                  // Proceed to next step
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      );
      
    // Handle all other publisher steps with content
    case 'integration-details':
    case 'ad-slot-config':
    case 'setup-wallet':
    case 'enable-test-mode':
    case 'go-live':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
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
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="py-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                {currentStep === 'integration-details' ? 'In a production implementation, this step would guide you through detailed configuration options.' :
                 currentStep === 'ad-slot-config' ? 'This step would allow you to define ad slot sizes, positions, and content preferences.' :
                 currentStep === 'setup-wallet' ? 'Connect your Lightning wallet to receive automatic payments from ad revenue.' :
                 currentStep === 'enable-test-mode' ? 'Enable test mode to see how ads will appear without charging advertisers.' :
                 'Finalize your settings and activate your publisher account.'}
              </p>
              
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
                {skipOnboarding && (
                  <button
                    type="button"
                    onClick={skipOnboarding}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Skip For Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
      
    case 'complete':
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-500 mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Publisher Setup Complete!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You've successfully set up your publisher account and are ready to start monetizing.
            </p>
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
                    Use the code snippets to integrate ads into your website or application.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Set Up Your Payment Wallet</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add a Lightning wallet to receive your earnings automatically.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 p-2 rounded-full text-purple-600 dark:text-purple-300 mr-3">
                  <Settings size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Customize Your Ad Settings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Define content categories and ad filtering rules in your dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border border-purple-100 dark:border-purple-800 rounded-md p-4 mb-6">
              <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                Your API Key
              </h4>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border border-purple-200 dark:border-purple-700 font-mono text-sm break-all mb-2">
                {apiKeyData.key || 'API key will appear here'}
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                Keep this key secure. You can manage your API keys in the Publisher Dashboard.
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Publisher Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Track earnings, manage placements, and configure settings
                  </p>
                  <a 
                    href="/dashboard/publisher" 
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm"
                  >
                    Go to Dashboard →
                  </a>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Developer Documentation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Detailed guides, API reference, and code examples
                  </p>
                  <a 
                    href="/docs/publisher" 
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm"
                  >
                    View Documentation →
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-8 rounded-md transition-colors"
                data-testid="publisher-dashboard-button"
                onClick={() => {
                  // Navigate to publisher dashboard
                  window.location.href = '/dashboard/publisher';
                }}
              >
                Go to Publisher Dashboard
              </button>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-300">Loading onboarding experience...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current step: {currentStep}</p>
        </div>
      );
  }
});

export default PublisherOnboarding;