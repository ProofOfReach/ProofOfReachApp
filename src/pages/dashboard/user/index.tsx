import { UserRole } from "@/types/role";
import React from 'react';
import useSWR from 'swr';
import { Home } from 'react-feather';

import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import CurrencyAmount from '@/components/CurrencyAmount';
// Import our viewer dashboard component
import ViewerDashboard from '@/components/dashboards/ViewerDashboard';

// Define fetcher for SWR
const fetcher = (url: string) => 
  fetch(url).then(res => {
    if (!res.ok) {
      throw new Error('An error occurred while fetching the data.');
    }
    return res.json();
  });

/**
 * User dashboard page with improved role management
 */
const UserDashboardPage = () => {
  // Fetch wallet balance
  const { data: walletData, isLoading: walletLoading } = useSWR('/api/wallet', fetcher);

  // Data to pass to our dashboard component
  const walletBalance = (walletData?.balance ?? 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Home className="h-8 w-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Viewer Dashboard</h1>
      </div>
      
      {/* Use the viewer dashboard component */}
      <ViewerDashboard />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <p className="text-gray-500 dark:text-gray-400">You haven't had any recent activity.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Wallet</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Balance:</span>
            {walletLoading ? (
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <span className="text-green-600 dark:text-green-400 font-medium">
                {walletData?.balance ?? 0 ? (
                  <CurrencyAmount sats={walletData?.balance ?? 0} />
                ) : (
                  '0 sats'
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommended Content</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Check out the Nostr Feed to discover content from your network.
        </p>
      </div>
    </div>
  );
};

// Use our improved dashboard layout
UserDashboardPage.getLayout = (page: React.ReactElement) => {
  return <ImprovedDashboardLayout title="Viewer Dashboard">{page}</ImprovedDashboardLayout>;
};

export default UserDashboardPage;