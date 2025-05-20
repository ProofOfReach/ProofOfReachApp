import React from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { 
  CheckCircle, 
  Target, 
  Calendar, 
  Image, 
  DollarSign, 
  BarChart 
} from 'react-feather';

interface AdvertiserOnboardingProps {
  currentStep: OnboardingStep;
  onComplete?: () => void;
  skipOnboarding?: () => void;
}

const AdvertiserOnboarding: React.FC<AdvertiserOnboardingProps> = ({ currentStep, skipOnboarding }) => {
  // Helper function to render section title with skip button
  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <>
      {skipOnboarding && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {icon}
            {title}
          </h2>
          <button
            onClick={skipOnboarding}
            className="px-4 py-2 flex items-center text-sm font-medium text-gray-700 bg-white dark:text-gray-300 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Skip For Now
          </button>
        </div>
      )}
      {!skipOnboarding && (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {icon}
          {title}
        </h2>
      )}
    </>
  );

  // Content for each step in the advertiser onboarding flow
  const renderStepContent = () => {
    switch (currentStep) {
      case 'create-campaign':
        return (
          <div className="space-y-4">
            {renderSectionHeader(<Image className="inline-block mr-2 mb-1" size={20} />, 'Create Your First Campaign')}
            <p className="text-gray-600 dark:text-gray-300">
              Let's set up your first advertising campaign on the Nostr network:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Campaign Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campaign Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g., Summer Bitcoin Campaign" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campaign Description
                    </label>
                    <textarea 
                      placeholder="Describe your campaign's goals and message" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Ad Creative</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ad Headline
                    </label>
                    <input 
                      type="text" 
                      placeholder="Attention-grabbing headline" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Keep it short and compelling (max 60 characters)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ad Description
                    </label>
                    <textarea 
                      placeholder="Describe your product or service" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      rows={2}
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      Highlight key benefits (max 120 characters)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Destination URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://example.com/landing-page" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Call to Action
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a CTA</option>
                      <option value="learn-more">Learn More</option>
                      <option value="sign-up">Sign Up</option>
                      <option value="buy-now">Buy Now</option>
                      <option value="get-started">Get Started</option>
                      <option value="download">Download</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'set-targeting':
        return (
          <div className="space-y-4">
            {renderSectionHeader(<Target className="inline-block mr-2 mb-1" size={20} />, 'Set Targeting Parameters')}
            <p className="text-gray-600 dark:text-gray-300">
              Define who you want to reach with your advertising campaign:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Content Categories</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input type="checkbox" id="cat-bitcoin" className="mr-2" defaultChecked />
                    <label htmlFor="cat-bitcoin">Bitcoin</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="cat-nostr" className="mr-2" defaultChecked />
                    <label htmlFor="cat-nostr">Nostr</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="cat-crypto" className="mr-2" />
                    <label htmlFor="cat-crypto">Cryptocurrency</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="cat-technology" className="mr-2" />
                    <label htmlFor="cat-technology">Technology</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="cat-finance" className="mr-2" />
                    <label htmlFor="cat-finance">Finance</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="cat-education" className="mr-2" />
                    <label htmlFor="cat-education">Education</label>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Interest Targeting</h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-developers" className="mr-2" defaultChecked />
                    <label htmlFor="interest-developers">Developers</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-investors" className="mr-2" defaultChecked />
                    <label htmlFor="interest-investors">Investors</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-traders" className="mr-2" />
                    <label htmlFor="interest-traders">Traders</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-privacy" className="mr-2" defaultChecked />
                    <label htmlFor="interest-privacy">Privacy Enthusiasts</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Interests (comma separated)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., lightning network, self-custody" 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  />
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Advanced Targeting</h3>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                    Premium
                  </span>
                </div>
                
                <div className="space-y-3 opacity-75">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      disabled
                    >
                      <option>Global (All Regions)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      disabled
                    >
                      <option>All Languages</option>
                    </select>
                  </div>
                </div>
                
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-3">
                  Advanced targeting options will be available after your first campaign
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'budget-schedule':
        return (
          <div className="space-y-4">
            {renderSectionHeader(<Calendar className="inline-block mr-2 mb-1" size={20} />, 'Set Budget & Schedule')}
            <p className="text-gray-600 dark:text-gray-300">
              Define your campaign budget and when it should run:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Campaign Budget</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Budget (in Sats)
                    </label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        placeholder="100000" 
                        defaultValue="100000"
                        min="50000"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      />
                      <span className="ml-2">sats</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum budget: 50,000 sats (~$5 USD)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Daily Spending Limit (Optional)
                    </label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        placeholder="10000" 
                        min="5000"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      />
                      <span className="ml-2">sats</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      If set, your campaign won't spend more than this amount per day
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Bidding Strategy</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input type="radio" id="bid-automatic" name="bid-strategy" className="mr-2" defaultChecked />
                    <div>
                      <label htmlFor="bid-automatic" className="font-medium">Automatic Bidding</label>
                      <p className="text-xs text-gray-500">
                        We'll optimize your bids to get the most clicks
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="radio" id="bid-manual" name="bid-strategy" className="mr-2" />
                    <div>
                      <label htmlFor="bid-manual" className="font-medium">Manual Bidding</label>
                      <p className="text-xs text-gray-500">
                        You set the maximum amount you're willing to pay per click
                      </p>
                    </div>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max CPC Bid (Cost per Click)
                      </label>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          placeholder="50" 
                          defaultValue="50"
                          min="10"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                          disabled
                        />
                        <span className="ml-2">sats</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max CPM Bid (Cost per 1000 Impressions)
                      </label>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          placeholder="1000" 
                          defaultValue="1000"
                          min="500"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                          disabled
                        />
                        <span className="ml-2">sats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Campaign Schedule</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date (Optional)
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If not set, campaign will run until budget is depleted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'fund-account':
        return (
          <div className="space-y-4">
            {renderSectionHeader(<DollarSign className="inline-block mr-2 mb-1" size={20} />, 'Fund Your Advertising Account')}
            <p className="text-gray-600 dark:text-gray-300">
              Add funds to your account to start your advertising campaign:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Select Amount</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="font-medium">100k sats</div>
                    <div className="text-xs text-gray-500">~$10 USD</div>
                  </div>
                  <div className="border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer">
                    <div className="font-medium text-purple-700 dark:text-purple-300">500k sats</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">~$50 USD</div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="font-medium">1M sats</div>
                    <div className="text-xs text-gray-500">~$100 USD</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Amount (sats)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Enter amount in sats" 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    min="50000"
                  />
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Method</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input type="radio" id="pay-lightning" name="payment-method" className="mr-2" defaultChecked />
                    <label htmlFor="pay-lightning" className="font-medium">Lightning Network (Instant)</label>
                  </div>
                  
                  <div className="border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-md bg-gray-50 dark:bg-gray-800 text-center">
                    <div className="text-sm mb-2">Lightning Invoice</div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-md mb-3">
                      <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                        QR Placeholder
                      </div>
                    </div>
                    <button className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Copy Invoice
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-green-500">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Fund Now to Activate Campaign</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your campaign will go live immediately after successful payment, or on your selected start date.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'dashboard-intro':
        return (
          <div className="space-y-4">
            {renderSectionHeader(<BarChart className="inline-block mr-2 mb-1" size={20} />, 'Your Advertiser Dashboard')}
            <p className="text-gray-600 dark:text-gray-300">
              Monitor and optimize your campaigns with these powerful tools:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Campaign Performance</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start border-l-4 border-purple-500 pl-3">
                    <div>
                      <div className="font-medium">Real-time Analytics</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        See impressions, clicks, and conversions as they happen
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start border-l-4 border-purple-500 pl-3">
                    <div>
                      <div className="font-medium">Performance Metrics</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Track CTR, conversion rates, and ROI across all campaigns
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start border-l-4 border-purple-500 pl-3">
                    <div>
                      <div className="font-medium">Publisher Breakdown</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        See which publishers are delivering the best results
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Campaign Management</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start border-l-4 border-blue-500 pl-3">
                    <div>
                      <div className="font-medium">Pause/Resume Campaigns</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Instantly control your campaign's status
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start border-l-4 border-blue-500 pl-3">
                    <div>
                      <div className="font-medium">Budget Adjustments</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Increase or decrease your campaign budget at any time
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start border-l-4 border-blue-500 pl-3">
                    <div>
                      <div className="font-medium">Ad Rotation</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Test multiple ad creatives to see which performs best
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Optimization Tools</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start border-l-4 border-green-500 pl-3">
                    <div>
                      <div className="font-medium">Performance Insights</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        AI-powered suggestions to improve your campaigns
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start border-l-4 border-green-500 pl-3">
                    <div>
                      <div className="font-medium">Audience Insights</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Learn more about who's engaging with your ads
                      </p>
                    </div>
                  </div>
                </div>
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
              You're Ready to Launch!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your advertiser account is set up and your first campaign is ready to go.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What's Next?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left ml-4 list-disc">
                <li>Your campaign will go live as scheduled</li>
                <li>Monitor performance in your Advertiser Dashboard</li>
                <li>Create additional ad variations to test different messages</li>
                <li>Add funds as needed to keep your campaigns running</li>
                <li>Check your performance metrics regularly for optimization opportunities</li>
              </ul>
            </div>
            
            <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mt-4">
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Your onboarding is complete! You'll be redirected to your Advertiser Dashboard.
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

export default AdvertiserOnboarding;