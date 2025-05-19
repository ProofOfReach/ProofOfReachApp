import React from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface PublisherOnboardingProps {
  currentStep: OnboardingStep;
}

const PublisherOnboarding: React.FC<PublisherOnboardingProps> = ({ currentStep }) => {
  // Step 1: Choose Integration Method
  const renderChooseIntegration = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Choose Integration Method</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Select how you'd like to integrate ads with your Nostr content.
      </p>
      
      <Tabs defaultValue="sdk" className="mt-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="sdk">JavaScript SDK</TabsTrigger>
          <TabsTrigger value="widget">Embed Widget</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sdk" className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium mb-2">JavaScript SDK</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              For developers who want full control over ad placement and appearance.
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm mb-4 overflow-x-auto">
              <pre>
{`// Install the SDK
npm install @nostr/ad-marketplace

// Initialize in your app
import { NostrAdMarketplaceSDK } from '@nostr/ad-marketplace';

const adSDK = new NostrAdMarketplaceSDK({
  apiKey: 'YOUR_API_KEY',
  pubkey: 'YOUR_NOSTR_PUBKEY'
});

// Fetch an ad
const ad = await adSDK.serveAd({ 
  placement: 'feed',
  format: 'text-image' 
});`}
              </pre>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                Copy Code
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Benefits of using the SDK:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Full control over ad rendering and placement</li>
              <li>Advanced targeting and customization options</li>
              <li>Better performance with native integration</li>
              <li>Support for multiple ad formats and placements</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="widget" className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium mb-2">Embed Widget</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Simple copy-paste HTML snippet for easy integration.
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm mb-4 overflow-x-auto">
              <pre>
{`<!-- Add this where you want ads to appear -->
<div 
  class="nostr-ad-space" 
  data-pubkey="YOUR_NOSTR_PUBKEY"
  data-placement="feed"
  data-format="text-image"
></div>

<!-- Add this script at the end of your body tag -->
<script 
  src="https://ads.nostr.market/embed.js" 
  async
></script>`}
              </pre>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                Copy Code
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Benefits of using the Widget:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>No coding required - just copy and paste</li>
              <li>Automatic updates and improvements</li>
              <li>Responsive design works on all devices</li>
              <li>Simple configuration via HTML attributes</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Step 2: Ad Slot Configuration
  const renderAdSlotConfig = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configure Ad Slots</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Set up how and where ads will appear in your content.
      </p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="ad-space-name">
                Ad Space Name
              </label>
              <Input 
                id="ad-space-name"
                placeholder="Main Feed Ads"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                A descriptive name to identify this ad slot
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium" htmlFor="ad-space-description">
                Description
              </label>
              <Textarea 
                id="ad-space-description"
                placeholder="Ads that appear in the main content feed"
                className="mt-1"
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Placement Type</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="placement-feed" defaultChecked />
                    <label htmlFor="placement-feed" className="text-sm">Feed</label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Ads appear inline with content
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="placement-sidebar" />
                    <label htmlFor="placement-sidebar" className="text-sm">Sidebar</label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Ads appear in a sidebar
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Format</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="format-text-image" defaultChecked />
                    <label htmlFor="format-text-image" className="text-sm">Text + Image</label>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="format-text" />
                    <label htmlFor="format-text" className="text-sm">Text Only</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Minimum Pricing</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="text-xs text-gray-500" htmlFor="min-cpm">
                    Min. satoshis per 1000 impressions
                  </label>
                  <Input
                    id="min-cpm"
                    type="number"
                    placeholder="1000"
                    min="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500" htmlFor="min-cpc">
                    Min. satoshis per click
                  </label>
                  <Input
                    id="min-cpc"
                    type="number"
                    placeholder="100"
                    min="10"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 3: Setup Wallet
  const renderSetupWallet = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Set Up Your Payout Wallet</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Connect a Lightning wallet to receive payments for ad impressions and clicks.
      </p>
      
      <div className="space-y-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium mb-1">Lightning Address</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Enter your Lightning address to receive payments (e.g., you@wallet.com)
                </p>
                <Input 
                  placeholder="your-name@lightning.wallet"
                />
              </div>
              
              <div className="pt-2">
                <h3 className="text-base font-medium mb-1">LNURL</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Or scan this QR code with your Lightning wallet
                </p>
                <div className="bg-white p-6 rounded-lg flex items-center justify-center border border-gray-200">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <p className="text-sm text-gray-500">QR code placeholder</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Details
                </h4>
                <ul className="mt-2 text-sm space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Payments are sent automatically when you reach the minimum threshold</li>
                  <li>• Minimum payout: 10,000 satoshis</li>
                  <li>• Payment frequency: Every 24 hours for balances above minimum</li>
                  <li>• No fees for Lightning payments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <div className="bg-green-100 dark:bg-green-800 rounded-full p-1 mr-3 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Test Payment Available</h3>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Once you've set up your wallet, you can simulate a test payment to verify everything is working.
              </p>
              <Button variant="outline" size="sm" className="mt-2 bg-white dark:bg-transparent">
                Send Test Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Enable Test Mode
  const renderEnableTestMode = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Enable Test Mode</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Preview how ads will look on your site before going live.
      </p>
      
      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox id="enable-test-mode" defaultChecked />
                <div>
                  <label htmlFor="enable-test-mode" className="font-medium block">
                    Enable Test Mode
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    In test mode, you'll see test ads that only appear to you
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
                <h3 className="text-sm font-medium mb-2">Preview Test Ad</h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex items-start">
                  <div className="bg-gray-200 dark:bg-gray-600 w-16 h-16 rounded mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="text-xs text-purple-600 mb-1">[TEST AD]</div>
                    <h4 className="font-medium">Sample Ad Title</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      This is how your ad will appear to users. Click to learn more.
                    </p>
                    <div className="mt-2 text-xs text-purple-600">example.com</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Test Settings</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1" htmlFor="test-duration">
                      Test Duration
                    </label>
                    <select
                      id="test-duration"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="1h">1 hour</option>
                      <option value="24h" selected>24 hours</option>
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1" htmlFor="test-ad-type">
                      Test Ad Type
                    </label>
                    <select
                      id="test-ad-type"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="all" selected>All formats</option>
                      <option value="text">Text only</option>
                      <option value="image">Image only</option>
                      <option value="text-image">Text + Image</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Test Mode Notice</h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Test ads don't generate real impressions or revenue. They're only visible to you while in test mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Go Live
  const renderGoLive = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Ready to Go Live</h2>
      <p className="text-gray-600 dark:text-gray-300">
        You've completed the setup process. Now you can activate your ad spaces.
      </p>
      
      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <h3 className="text-base font-medium">Publisher Dashboard Tour</h3>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-sm">Key Dashboard Features</h4>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-start">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Analytics Dashboard</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        View earnings, impressions, CTR, and other key metrics
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Payments</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Track your earnings and payment history
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Ad Space Management</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Create, edit, and manage your ad spaces
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Content Filtering</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Set rules for what types of ads can appear
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4">
                <Checkbox id="activate-live-ads" />
                <div>
                  <label htmlFor="activate-live-ads" className="font-medium block">
                    Activate Live Ads
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Start showing real ads and earning revenue
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Step 6: Complete
  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold">Congratulations!</h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        Your publisher account is set up and ready to go. You can now monetize your Nostr content with targeted ads.
      </p>
      
      <div className="pt-4">
        <div className="text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="font-medium text-purple-800 dark:text-purple-400">Next Steps</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">1.</span>
              Integrate the ad code into your Nostr client or website
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">2.</span>
              Visit your Publisher Dashboard to track earnings
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">3.</span>
              Create additional ad spaces for different parts of your content
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render the appropriate step
  switch (currentStep) {
    case 'choose-integration':
      return renderChooseIntegration();
    case 'ad-slot-config':
      return renderAdSlotConfig();
    case 'setup-wallet':
      return renderSetupWallet();
    case 'enable-test-mode':
      return renderEnableTestMode();
    case 'go-live':
      return renderGoLive();
    case 'complete':
      return renderComplete();
    default:
      return renderChooseIntegration();
  }
};

export default PublisherOnboarding;