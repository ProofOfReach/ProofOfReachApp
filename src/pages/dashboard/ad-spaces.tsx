import React from 'react';
import { useRouter } from 'next/router';

const AdSpacesPage = () => {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Spaces</h1>
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        Manage your advertising spaces and placements.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Active Spaces</h3>
          <p className="text-3xl font-bold text-blue-600">3</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Impressions</h3>
          <p className="text-3xl font-bold text-green-600">24.5K</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Fill Rate</h3>
          <p className="text-3xl font-bold text-purple-600">87%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Ad Spaces</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-semibold">Homepage Banner</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">728x90 - Active</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">1,240 impressions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-semibold">Sidebar Ad</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">300x250 - Active</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">890 impressions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSpacesPage;