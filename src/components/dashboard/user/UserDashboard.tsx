import React from 'react';
import useSWR from 'swr';
import { Calendar, Activity, Users } from 'react-feather';
import CurrencyAmount from '@/components/CurrencyAmount';

// Define fetcher for SWR
const fetcher = (url: string) => 
  fetch(url).then(res => {
    if (!res.ok) {
      throw new Error('An error occurred while fetching the data.');
    }
    return res.json();
  });

/**
 * User dashboard component that shows recent activity and stats
 * This is a component version that can be used within any page
 */
const UserDashboard: React.FC = () => {
  // Fetch user stats
  const { data: statsData, isLoading: statsLoading } = useSWR('/api/stats/user', fetcher, {
    revalidateOnFocus: false,
    // Fallback to empty data to avoid errors
    fallbackData: { viewCount: 0, contentCount: 0, followersCount: 0 }
  });

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mr-4">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Views</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {statsLoading ? (
                  <span className="inline-block h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                ) : (
                  statsData?.viewCount?.toLocaleString() || '0'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mr-4">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Content</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {statsLoading ? (
                  <span className="inline-block h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                ) : (
                  statsData?.contentCount?.toLocaleString() || '0'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mr-4">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Followers</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {statsLoading ? (
                  <span className="inline-block h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                ) : (
                  statsData?.followersCount?.toLocaleString() || '0'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Marketplace Roles
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Advertiser</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create and manage ad campaigns on the marketplace
              </p>
            </div>
            <a 
              href="/dashboard/role-switcher"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Switch to Advertiser
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Publisher</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monetize your content by displaying ads on your platform
              </p>
            </div>
            <a 
              href="/dashboard/role-switcher"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Switch to Publisher
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;