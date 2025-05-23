import React, { useEffect, useState } from 'react';
import '@/components/layout/ImprovedDashboardLayout';
import { Settings, Save, RefreshCw, UserCheck, Bell, Moon, Sun, Shield, Lock, Plus, X, AlertCircle, Info } from 'react-feather';

const UserSettingsPage = () => {
  // Form state
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [logMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Data sharing preferences
  const [shareLocation, setShareLocation] = useState<boolean>(false);
  const [shareInterests, setShareInterests] = useState<boolean>(false);
  const [shareBrowsing, setShareBrowsing] = useState<boolean>(false);
  const [shareAge, setShareAge] = useState<boolean>(false);
  
  // Interest whitelist and blacklist
  const [allowedInterests, setAllowedInterests] = useState<string[]>([
    'bitcoin', 'lightning', 'crypto', 'programming'
  ]);
  const [blockedInterests, setBlockedInterests] = useState<string[]>([
    'gambling', 'politics'
  ]);
  const [newAllowedInterest, setNewAllowedInterest] = useState<string>('');
  const [newBlockedInterest, setNewBlockedInterest] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipDismissed, setTooltipDismissed] = useState<boolean>(false);
  
  // Initialize form with user data
  useEffect(() => {
    // In a real app, we would fetch the user's settings from the API
    setDisplayName('Satoshi Nakamoto');
    setBio('Bitcoin enthusiast. Lightning Network advocate. Privacy-focused.');
    
    // Check if dark mode is enabled
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Check if the tooltip has been dismissed before
    const isTooltipDismissed = localStorage.getItem('dataSharingTooltipDismissed') === 'true';
    setTooltipDismissed(isTooltipDismissed);
    
    // Fetch user preferences - this is a simulated API call
    const fetchUserPreferences = async () => {
      try {
        // In a real app, we would do something like:
        // const response = await fetch('/api/users/preferences');
        // const data = await response.json();
        
        // Simulate API response with a delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simulated response data
        const data = {
          shareLocation: false,
          shareInterests: true,
          shareBrowsing: false,
          shareAge: true
        };
        
        // Update state with fetched preferences
        setShareLocation(data.shareLocation);
        setShareInterests(data.shareInterests);
        setShareBrowsing(data.shareBrowsing);
        setShareAge(data.shareAge);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    
    fetchUserPreferences();
  }, []);

  // Handler to add allowed interest
  const handleAddAllowedInterest = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (newAllowedInterest.trim() === '') return;
    
    const interestToAdd = newAllowedInterest.trim().toLowerCase();
    
    // Add to allowed interests if not already present
    if (!allowedInterests.includes(interestToAdd)) {
      const updatedAllowedInterests = [...allowedInterests, interestToAdd];
      setAllowedInterests(updatedAllowedInterests);
      
      // If this interest is in blocked list, remove it from there
      if (blockedInterests.includes(interestToAdd)) {
        const updatedBlockedInterests = blockedInterests.filter(
          interest => interest !== interestToAdd
        );
        setBlockedInterests(updatedBlockedInterests);
      }
    }
    
    setNewAllowedInterest('');
  };
  
  // Handler to add blocked interest
  const handleAddBlockedInterest = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (newBlockedInterest.trim() === '') return;
    
    const interestToBlock = newBlockedInterest.trim().toLowerCase();
    
    // Add to blocked interests if not already present
    if (!blockedInterests.includes(interestToBlock)) {
      const updatedBlockedInterests = [...blockedInterests, interestToBlock];
      setBlockedInterests(updatedBlockedInterests);
      
      // If this interest is in allowed list, remove it from there
      if (allowedInterests.includes(interestToBlock)) {
        const updatedAllowedInterests = allowedInterests.filter(
          interest => interest !== interestToBlock
        );
        setAllowedInterests(updatedAllowedInterests);
      }
    }
    
    setNewBlockedInterest('');
  };
  
  // Handler to remove allowed interest
  const handleRemoveAllowedInterest = (interest: string) => {
    setAllowedInterests(allowedInterests.filter(item => item !== interest));
  };
  
  // Handler to remove blocked interest
  const handleRemoveBlockedInterest = (interest: string) => {
    setBlockedInterests(blockedInterests.filter(item => item !== interest));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save dark mode preference to localStorage
      localStorage.setItem('darkMode', darkMode.toString());
      
      // In a real app, we would send all preferences to the server
      // This would include sending the data sharing preferences to update UserPreferences
      console.log('Saving user preferences:', {
        profile: { displayName, bio },
        notifications: { emailNotifications },
        appearance: { darkMode },
        privacy: { 
          shareLocation, 
          shareInterests, 
          shareBrowsing, 
          shareAge,
          allowedInterests,
          blockedInterests
        }
      });
      
      // Show log message
      setSuccessMessage('Settings saved logfully!');
      
      // Clear log message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImprovedDashboardLayout title="User Settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-8 w-8 text-gray-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          </div>
        </div>

        {/* Success message */}
        {logMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{logMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              <UserCheck className="inline-block w-5 h-5 mr-2 text-blue-500" />
              Profile Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="pubkey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nostr Public Key (npub)
                </label>
                <input
                  type="text"
                  name="pubkey"
                  id="pubkey"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value="npub1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Your Nostr public key is used to identify you on the network
                </p>
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  id="displayName"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Brief description that will be visible on your public profile
                </p>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              <Bell className="inline-block w-5 h-5 mr-2 text-purple-500" />
              Notification Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications about your account activity via email
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input 
                    id="emailNotifications" 
                    type="checkbox" 
                    className="sr-only"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                    aria-label="email notifications"
                  />
                  <label 
                    htmlFor="emailNotifications" 
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${emailNotifications ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span 
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Privacy & Data Sharing Settings */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              <Shield className="inline-block w-5 h-5 mr-2 text-green-500" />
              Privacy & Data Sharing
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Control what information is shared with advertisers on the Nostr Ad Marketplace. Enabling these options may improve ad relevance.
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="shareLocation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location Data
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow advertisers to use your approximate location
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input 
                    id="shareLocation" 
                    type="checkbox" 
                    className="sr-only"
                    checked={shareLocation}
                    onChange={() => setShareLocation(!shareLocation)}
                    aria-label="share location"
                  />
                  <label 
                    htmlFor="shareLocation" 
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${shareLocation ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span 
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${shareLocation ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="shareInterests" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Interest-Based Ads
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow ads based on your interests and preferences
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input 
                    id="shareInterests" 
                    type="checkbox" 
                    className="sr-only"
                    checked={shareInterests}
                    onChange={() => setShareInterests(!shareInterests)}
                    aria-label="share interests"
                  />
                  <label 
                    htmlFor="shareInterests" 
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${shareInterests ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span 
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${shareInterests ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Submission */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Danger Zone</h3>
          <p className="text-red-700 dark:text-red-400 mb-4">
            Actions in this section are irreversible and should be used with caution.
          </p>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Account
          </button>
        </div>
      </div>
    </ImprovedDashboardLayout>
  );
};

export default UserSettingsPage;