import React from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface ViewerOnboardingProps {
  currentStep: OnboardingStep;
}

const ViewerOnboarding: React.FC<ViewerOnboardingProps> = ({ currentStep }) => {
  // This component handles all steps for the viewer role onboarding

  // Step 1: Select Interests
  const renderSelectInterests = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">What are you interested in?</h2>
      <p className="text-gray-600 dark:text-gray-300">
        This helps us show you more relevant content and ads. You can change these later.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        {['Bitcoin', 'Lightning Network', 'Nostr', 'Privacy', 'Development', 'Design', 
          'Finance', 'Gaming', 'Art', 'Music', 'Writing', 'Education'].map(interest => (
          <div key={interest} className="flex items-center space-x-2">
            <Checkbox id={`interest-${interest}`} />
            <label 
              htmlFor={`interest-${interest}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {interest}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 2: Connect Lightning Wallet
  const renderConnectWallet = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Connect a Lightning Wallet</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Connect a Lightning wallet to receive earnings from viewed ads. 
        You can use any LNURL-compatible wallet.
      </p>
      
      <div className="space-y-4 mt-4">
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Connect with LNURL</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Scan a QR code with your Lightning wallet to connect
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 h-48 rounded flex items-center justify-center">
            <p className="text-sm text-gray-500">QR code placeholder</p>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-medium mb-2">Enter Lightning Address</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Manually enter your Lightning address (e.g., you@wallet.com)
          </p>
          <Input 
            placeholder="your-name@lightning.wallet"
          />
        </div>

        <div className="text-center text-sm text-gray-500 mt-2">
          Don't have a Lightning wallet? <a href="#" className="text-purple-600 hover:underline">Learn more</a>
        </div>
      </div>
    </div>
  );

  // Step 3: Privacy Settings
  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Privacy Settings</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Control what information is shared with publishers and advertisers.
        You can change these settings at any time.
      </p>
      
      <div className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox id="share-interests" defaultChecked />
                <div>
                  <label htmlFor="share-interests" className="font-medium block">
                    Share interests
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow advertisers to target you based on your selected interests
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox id="share-location" />
                <div>
                  <label htmlFor="share-location" className="font-medium block">
                    Share approximate location
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow country/region based targeting for more relevant content
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox id="personalized-ads" defaultChecked />
                <div>
                  <label htmlFor="personalized-ads" className="font-medium block">
                    Personalized ads
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive ads tailored to your activity and interests
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox id="activity-tracking" />
                <div>
                  <label htmlFor="activity-tracking" className="font-medium block">
                    Activity tracking
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow tracking clicks and interactions to improve ad relevance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Step 4: First-Ad Tutorial
  const renderFirstAdTutorial = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">How Earning Works</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Here's how you earn satoshis from ads on the Nostr network.
      </p>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Example Ad</h3>
        </div>
        <div className="p-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-4">
            <div className="flex items-start">
              <div className="bg-gray-200 dark:bg-gray-600 w-16 h-16 rounded mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Bitcoin Conference 2025</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Join the largest Bitcoin conference in the world. Early bird tickets available now!
                </p>
                <div className="mt-2 text-xs text-purple-600">bitcoinconf.com</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2">1</span>
              <p>You see an ad while browsing Nostr content</p>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2">2</span>
              <p>The longer you view the ad, the more sats you earn</p>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2">3</span>
              <p>If you click on ads relevant to you, you earn additional sats</p>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2">4</span>
              <p>Earnings are added to your balance and can be withdrawn to your Lightning wallet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Earnings Teaser
  const renderEarningsTeaser = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Track Your Earnings</h2>
      <p className="text-gray-600 dark:text-gray-300">
        You can easily monitor your earnings and withdraw your satoshis anytime.
      </p>
      
      <div className="space-y-4 mt-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Current Balance</h3>
            <span className="text-xl font-bold">0 sats</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0 sats</span>
            <span>Withdraw min: 1,000 sats</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">Notification Settings</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-earnings" defaultChecked />
                  <label htmlFor="notify-earnings" className="text-sm">Daily earnings summary</label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-withdrawal" defaultChecked />
                  <label htmlFor="notify-withdrawal" className="text-sm">Withdrawal available alerts</label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-tips" defaultChecked />
                  <label htmlFor="notify-tips" className="text-sm">Earning tips and opportunities</label>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      
      <h2 className="text-2xl font-semibold">You're all set!</h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        You've successfully set up your viewer account. Start browsing content and earning satoshis!
      </p>
      
      <div className="pt-4">
        <div className="text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="font-medium text-purple-800 dark:text-purple-400">Pro Tips</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">•</span>
              Engage with relevant ads to maximize your earnings
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">•</span>
              Update your interests regularly for better ad targeting
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-600">•</span>
              Connect your Lightning wallet to withdraw earnings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render the appropriate step
  switch (currentStep) {
    case 'select-interests':
      return renderSelectInterests();
    case 'connect-wallet':
      return renderConnectWallet();
    case 'privacy-settings':
      return renderPrivacySettings();
    case 'first-ad-tutorial':
      return renderFirstAdTutorial();
    case 'earnings-teaser':
      return renderEarningsTeaser();
    case 'complete':
      return renderComplete();
    default:
      return renderSelectInterests();
  }
};

export default ViewerOnboarding;