import React from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { 
  CheckCircle, 
  Search, 
  Filter, 
  Bell, 
  ThumbsUp, 
  Shield
} from 'react-feather';

interface ViewerOnboardingProps {
  currentStep: OnboardingStep;
}

const ViewerOnboarding: React.FC<ViewerOnboardingProps> = ({ currentStep }) => {
  // Content for each step in the viewer onboarding flow
  const renderStepContent = () => {
    switch (currentStep) {
      case 'preferences':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Filter className="inline-block mr-2 mb-1" size={20} />
              Set Your Ad Preferences
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Tell us what kinds of ads you'd prefer to see across the Nostr network:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Interest Categories</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-bitcoin" className="mr-2" defaultChecked />
                    <label htmlFor="interest-bitcoin">Bitcoin</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-nostr" className="mr-2" defaultChecked />
                    <label htmlFor="interest-nostr">Nostr</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-tech" className="mr-2" defaultChecked />
                    <label htmlFor="interest-tech">Technology</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-privacy" className="mr-2" defaultChecked />
                    <label htmlFor="interest-privacy">Privacy & Security</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-defi" className="mr-2" />
                    <label htmlFor="interest-defi">DeFi</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-education" className="mr-2" />
                    <label htmlFor="interest-education">Education</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-freedom" className="mr-2" />
                    <label htmlFor="interest-freedom">Freedom Tech</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="interest-art" className="mr-2" />
                    <label htmlFor="interest-art">Digital Art & NFTs</label>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Content Preferences</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ad Format Preference
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      defaultValue="text-image"
                    >
                      <option value="text-image">Text & Image (Recommended)</option>
                      <option value="text-only">Text Only</option>
                      <option value="image-only">Image Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preferred Ad Frequency
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                      defaultValue="balanced"
                    >
                      <option value="minimal">Minimal - See fewer ads</option>
                      <option value="balanced">Balanced (Recommended)</option>
                      <option value="standard">Standard</option>
                    </select>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="pref-relevant" className="mr-2" defaultChecked />
                      <label htmlFor="pref-relevant">
                        Only show ads relevant to my interests
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'discovery':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Search className="inline-block mr-2 mb-1" size={20} />
              Discover Content Creators
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Follow publishers who create the content you enjoy:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Recommended Publishers</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 mr-3">
                      BTC
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Bitcoin Magazine</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The world's first and leading publication dedicated to Bitcoin
                      </p>
                      <div className="mt-2">
                        <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-300">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3">
                      NT
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Nostr Talk</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The latest news and updates about the Nostr protocol and ecosystem
                      </p>
                      <div className="mt-2">
                        <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-300">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 mr-3">
                      PS
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Privacy Solutions</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tools and strategies for digital privacy and security
                      </p>
                      <div className="mt-2">
                        <button className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-300">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Search Publishers</h3>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name or Nostr pubkey" 
                    className="w-full p-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Bell className="inline-block mr-2 mb-1" size={20} />
              Notification Preferences
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose how you want to be notified about new content and updates:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Email Notifications</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="notify-newsletter" className="font-medium">Newsletter</label>
                      <p className="text-xs text-gray-500">Weekly digest of top content</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="notify-newsletter" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="notify-publishers" className="font-medium">Publisher Updates</label>
                      <p className="text-xs text-gray-500">When publishers you follow post new content</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="notify-publishers" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="notify-tips" className="font-medium">Tips & Rewards</label>
                      <p className="text-xs text-gray-500">Notifications about earnings and rewards</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="notify-tips" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">In-App Notifications</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="notify-app-content" className="font-medium">New Content</label>
                      <p className="text-xs text-gray-500">When new content matches your interests</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="notify-app-content" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="notify-app-mentions" className="font-medium">Mentions & Replies</label>
                      <p className="text-xs text-gray-500">When someone mentions or replies to you</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="notify-app-mentions" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="notify-app-system" className="font-medium">System Updates</label>
                      <p className="text-xs text-gray-500">Important platform announcements</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="notify-app-system" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'privacy':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Shield className="inline-block mr-2 mb-1" size={20} />
              Privacy & Data Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Control your privacy and how your data is used on the platform:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Data Collection</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="privacy-analytics" className="font-medium">Analytics & Improvements</label>
                      <p className="text-xs text-gray-500">Allow collection of anonymized usage data to improve the platform</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="privacy-analytics" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="privacy-personalization" className="font-medium">Personalization</label>
                      <p className="text-xs text-gray-500">Use your activity to personalize your experience</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="privacy-personalization" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Content & Ads</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="privacy-ad-tracking" className="font-medium">Ad Tracking</label>
                      <p className="text-xs text-gray-500">Allow tracking of ad interactions for better targeting</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="privacy-ad-tracking" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="privacy-content-filter" className="font-medium">Content Filtering</label>
                      <p className="text-xs text-gray-500">Filter sensitive or adult content</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" id="privacy-content-filter" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Data Management</h3>
                
                <div className="space-y-3">
                  <button className="w-full py-2 px-4 border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                    Download My Data
                  </button>
                  
                  <button className="w-full py-2 px-4 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <ThumbsUp className="inline-block mr-2 mb-1" size={20} />
              Your Feedback Matters
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Help us improve the platform by sharing your thoughts:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">How would you rate your experience so far?</h3>
                
                <div className="flex space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button 
                      key={rating} 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition ${
                        rating === 5 ? 
                        'bg-purple-600 text-white' : 
                        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    What do you like most about our platform?
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    rows={3}
                    placeholder="Share what you enjoy about our service..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    How can we improve?
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    rows={3}
                    placeholder="Any suggestions for improvement..."
                  ></textarea>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Would you like to join our user research panel?</h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  We occasionally conduct user research sessions to gather feedback and improve our product. These sessions typically last 30 minutes and participants receive rewards in Bitcoin.
                </p>
                
                <div className="flex items-center space-x-4">
                  <button className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition">
                    Yes, I'm interested
                  </button>
                  <button className="py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    No thanks
                  </button>
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
              You're All Set!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your viewer profile is now complete, and you're ready to enjoy personalized content on the Nostr network.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What's Next?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left ml-4 list-disc">
                <li>Explore content from your favorite publishers</li>
                <li>Discover new creators based on your interests</li>
                <li>Engage with content you enjoy</li>
                <li>Receive personalized content recommendations</li>
                <li>Support your favorite creators through the Lightning Network</li>
              </ul>
            </div>
            
            <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mt-4">
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Your onboarding is complete! You'll be redirected to your personalized feed.
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

export default ViewerOnboarding;