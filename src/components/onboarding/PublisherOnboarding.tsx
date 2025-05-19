import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Code, DollarSign, Layout, Settings, CheckCircle, ToggleRight, Archive } from 'react-feather';

interface PublisherOnboardingProps {
  currentStep: OnboardingStep;
}

type IntegrationType = 'simple' | 'javascript' | 'sdk' | null;

const PublisherOnboarding: React.FC<PublisherOnboardingProps> = ({ currentStep }) => {
  // State to track which integration method was selected
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>(null);
  
  // Content for each step in the publisher onboarding flow
  // Pass integration selection to parent component for context
  useEffect(() => {
    // This is where you would store the selection in a real app
    console.log('Selected integration method:', selectedIntegration);
  }, [selectedIntegration]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'integration-details':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Code className="inline-block mr-2 mb-1" size={20} />
              Integration Details
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Follow these steps to integrate Nostr Ads into your platform:
            </p>
            
            {selectedIntegration === 'simple' && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Add the Nostr Ads Script</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add this script tag to the &lt;head&gt; section of your HTML:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<script src="https://ads.nostr.com/sdk.js" async></script>`}
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Place Ad Container</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add this HTML element wherever you want an ad to appear:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<div class="nostr-ad" data-placement="sidebar"></div>`}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You can use different placement values: "feed", "sidebar", "banner"
                  </p>
                </div>
              </div>
            )}
            
            {selectedIntegration === 'javascript' && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Include the SDK</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add the Nostr Ads SDK to your website:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<script src="https://ads.nostr.com/sdk.js"></script>`}
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Initialize the SDK</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Configure the SDK with your publisher key:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<script>
NostrAds.init({
  publisherKey: 'YOUR_PUBLISHER_KEY',
  defaultPlacement: 'feed'
});
</script>`}
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Load Ads Programmatically</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add this code to display ads in your content:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<script>
// Create an ad container element
const adContainer = document.getElementById('ad-container');

// Load an ad into the container
NostrAds.loadAd('sidebar', adContainer);
</script>`}
                  </div>
                </div>
              </div>
            )}
            
            {selectedIntegration === 'sdk' && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Install the SDK Package</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Use npm or yarn to install the SDK:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    npm install @nostr-ads/sdk<br/>
                    # Or with yarn<br/>
                    yarn add @nostr-ads/sdk
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Import and Configure</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    In your application code:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`import { NostrAdsSDK } from '@nostr-ads/sdk';

// Initialize the SDK
const adsClient = new NostrAdsSDK({
  apiKey: 'YOUR_PUBLISHER_API_KEY',
  pubkey: 'YOUR_NOSTR_PUBKEY'
});`}
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Use the SDK Components</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    For React applications:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`import { AdUnit } from '@nostr-ads/react';

function MyComponent() {
  return (
    <div>
      <h2>My Content</h2>
      <p>Content here...</p>
      <AdUnit placement="feed" />
    </div>
  );
}`}
                  </div>
                </div>
              </div>
            )}
            
            {!selectedIntegration && (
              <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-700 dark:text-yellow-300">
                  Please go back and select an integration method first.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'choose-integration':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Code className="inline-block mr-2 mb-1" size={20} />
              Choose Your Integration
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select how you want to integrate ads into your Nostr content:
            </p>
            
            <div className="space-y-4 mt-4">
              <div 
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 cursor-pointer"
                onClick={() => setSelectedIntegration('simple')}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Simple Embed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add a single line of code to show ads automatically in your content. 
                  Perfect for blogs, websites, or any HTML-based platform.
                </p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Easiest</span>
                </div>
              </div>
              
              <div 
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 cursor-pointer"
                onClick={() => setSelectedIntegration('javascript')}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">JavaScript API</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Full control over ad placement and appearance using our JavaScript API.
                  Ideal for custom implementations and fine-grained control.
                </p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Advanced</span>
                </div>
              </div>
              
              <div 
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 cursor-pointer"
                onClick={() => setSelectedIntegration('sdk')}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Client SDK</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Use our SDK for React, Vue, or vanilla JavaScript for the best experience.
                  Recommended for custom applications and framework-based sites.
                </p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Recommended</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'ad-slot-config':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Layout className="inline-block mr-2 mb-1" size={20} />
              Configure Ad Slots
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Set up where and how ads will appear in your content:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Content Category</h3>
                </div>
                <div className="mb-4">
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="education">Education</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="bitcoin">Bitcoin</option>
                    <option value="nostr">Nostr</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps match relevant ads to your content
                  </p>
                </div>
                
                <div className="flex justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Ad Format</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="format-text" name="format" className="mr-2" defaultChecked />
                    <label htmlFor="format-text">Text & Image (Recommended)</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="format-image" name="format" className="mr-2" />
                    <label htmlFor="format-image">Image Only</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="format-text-only" name="format" className="mr-2" />
                    <label htmlFor="format-text-only">Text Only</label>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Ad Position</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-top" className="mr-2" defaultChecked />
                      <label htmlFor="pos-top">Top of Content</label>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-bottom" className="mr-2" defaultChecked />
                      <label htmlFor="pos-bottom">Bottom of Content</label>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-inline" className="mr-2" />
                      <label htmlFor="pos-inline">Inline (Between content)</label>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-sidebar" className="mr-2" />
                      <label htmlFor="pos-sidebar">Sidebar</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'setup-wallet':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <DollarSign className="inline-block mr-2 mb-1" size={20} />
              Set Up Your Bitcoin Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Configure how you'll receive payments from ads shown on your content:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Lightning Address</h3>
                <input 
                  type="text" 
                  placeholder="your@lightning.address" 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A Lightning Address allows you to receive Bitcoin payments easily
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Threshold</h3>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    placeholder="1000" 
                    defaultValue="1000"
                    min="1000"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  />
                  <span className="ml-2">sats</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Payments will be automatically sent when your balance reaches this amount (minimum 1000 sats)
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Schedule</h3>
                <select 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  defaultValue="weekly"
                >
                  <option value="daily">Daily (if above threshold)</option>
                  <option value="weekly">Weekly (if above threshold)</option>
                  <option value="monthly">Monthly (regardless of threshold)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How often you'd like to receive payments from your ad revenue
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'enable-test-mode':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <ToggleRight className="inline-block mr-2 mb-1" size={20} />
              Test Your Ad Implementation
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Before going live, it's important to test your ad implementation:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <ToggleRight className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Test Mode is Active</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Test ads will be shown on your site but you won't earn real revenue yet.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition">
                    Copy Test Ad Code
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Test Instructions</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Copy the code snippet above</li>
                  <li>Add it to your website or Nostr client</li>
                  <li>Visit your site to verify ads are showing correctly</li>
                  <li>Check different devices and screen sizes</li>
                  <li>If everything looks good, proceed to the next step</li>
                </ol>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Preview</h3>
                <div className="border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-md bg-gray-50 dark:bg-gray-800 h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>Test ad will appear here</p>
                    <p className="text-xs mt-1">300x250 - Rectangle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'go-live':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Settings className="inline-block mr-2 mb-1" size={20} />
              Ready to Go Live
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your ad spaces are configured and tested. Complete your setup by finalizing these settings:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Ad Content Settings</h3>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Content Restrictions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="block-adult" className="mr-2" defaultChecked />
                      <label htmlFor="block-adult" className="text-sm">Block adult content</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="block-gambling" className="mr-2" defaultChecked />
                      <label htmlFor="block-gambling" className="text-sm">Block gambling</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="block-political" className="mr-2" />
                      <label htmlFor="block-political" className="text-sm">Block political ads</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Blocked Advertisers</h4>
                  <textarea 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 text-sm"
                    placeholder="Enter comma-separated list of blocked advertiser pubkeys"
                    rows={2}
                  ></textarea>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Minimum Bid Requirements</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm block mb-1">Min. Bid per Impression</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                        defaultValue="2"
                        min="1"
                      />
                      <span className="ml-2 text-sm">sats</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Min. Bid per Click</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                        defaultValue="50"
                        min="10"
                      />
                      <span className="ml-2 text-sm">sats</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
                <div className="mr-3">
                  <CheckCircle size={20} />
                </div>
                <p className="text-sm">You're ready to activate your ad spaces and start earning!</p>
              </div>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Congratulations!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your publisher account is now set up and ready to start monetizing your content with ads.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What's next?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left ml-4 list-disc">
                <li>Implement the ad code on your website or Nostr client</li>
                <li>Monitor your earnings in the Publisher Dashboard</li>
                <li>Optimize ad placements to maximize revenue</li>
                <li>Receive automatic payments to your Lightning address</li>
              </ul>
            </div>
            
            <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mt-4">
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Your onboarding is complete! You'll be redirected to your Publisher Dashboard.
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              Unknown step: {currentStep}. Please go back and try again.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="py-4">
      {renderStepContent()}
    </div>
  );
};

export default PublisherOnboarding;