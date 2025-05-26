import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { defaultUseRole } from '../../../context/RoleContext';
import { useAuth } from '../../../hooks/useAuth';
import { Settings, Save, RefreshCw } from 'react-feather';

const AdvertiserSettingsPage = () => {
  const { role } = defaultUseRole();
  const router = useRouter();
  const { auth } = useAuth();
  
  // Form state
  const [notifyOnApproval, setNotifyOnApproval] = useState<boolean>(true);
  const [notifyOnRejection, setNotifyOnRejection] = useState<boolean>(true);
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState<number | null>(1000);
  const [autoRenew, setAutoRenew] = useState<boolean>(false);
  const [defaultBidRate, setDefaultBidRate] = useState<number | null>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [logMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Redirect if not in advertiser role
  useEffect(() => {
    if (role !== 'advertiser') {
      router.push(`/dashboard${role !== 'viewer' ? `/${role}` : ''}`);
    }
  }, [role, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show log message
      setSuccessMessage('Settings saved logfully!');
      
      // Clear log message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.log('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advertiser Settings</h1>
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
        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="notifyOnApproval" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notify on ad approval
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when your ads are approved by publishers
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="notifyOnApproval" 
                  type="checkbox" 
                  className="sr-only"
                  checked={notifyOnApproval}
                  onChange={() => setNotifyOnApproval(!notifyOnApproval)}
                  aria-label="notify on approval"
                />
                <label 
                  htmlFor="notifyOnApproval" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${notifyOnApproval ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${notifyOnApproval ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="notifyOnRejection" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notify on ad rejection
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when your ads are rejected by publishers
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="notifyOnRejection" 
                  type="checkbox" 
                  className="sr-only"
                  checked={notifyOnRejection}
                  onChange={() => setNotifyOnRejection(!notifyOnRejection)}
                  aria-label="notify on rejection"
                />
                <label 
                  htmlFor="notifyOnRejection" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${notifyOnRejection ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${notifyOnRejection ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Budget Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget & Billing Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="dailyBudgetLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Budget Limit (sats)
              </label>
              <input
                type="number"
                id="dailyBudgetLimit"
                name="dailyBudgetLimit"
                value={dailyBudgetLimit || ''}
                onChange={(e) => setDailyBudgetLimit(e.target.value ? Number(e.target.value) : null)}
                placeholder="Enter daily limit"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set a maximum daily spending limit for all your ad campaigns
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="autoRenew" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-renew campaigns
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically renew campaigns when budget is depleted
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="autoRenew" 
                  type="checkbox" 
                  className="sr-only"
                  checked={autoRenew}
                  onChange={() => setAutoRenew(!autoRenew)}
                  aria-label="auto renew campaigns"
                />
                <label 
                  htmlFor="autoRenew" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${autoRenew ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${autoRenew ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="defaultBidRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Bid Rate (sats per impression)
              </label>
              <input
                type="number"
                id="defaultBidRate"
                name="defaultBidRate"
                value={defaultBidRate || ''}
                onChange={(e) => setDefaultBidRate(e.target.value ? Number(e.target.value) : null)}
                placeholder="Enter default bid"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set a default bid amount to use for new campaigns
              </p>
            </div>
          </div>
        </div>
        
        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="advertiserName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Advertiser Name (public)
              </label>
              <input
                type="text"
                id="advertiserName"
                name="advertiserName"
                defaultValue="My Business"
                placeholder="Enter your business name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This name will be visible to publishers reviewing your ads
              </p>
            </div>
            
            <div>
              <label htmlFor="advertiserWebsite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                id="advertiserWebsite"
                name="advertiserWebsite"
                defaultValue="https://example.com"
                placeholder="Enter your website URL"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Wrap the page with our layout
AdvertiserSettingsPage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default AdvertiserSettingsPage;