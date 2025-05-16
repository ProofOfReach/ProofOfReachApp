import React from 'react';

const AdvertiserDashboard = () => {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-3">
        Advertiser Dashboard
      </h3>
      <p className="text-orange-700 dark:text-orange-400 mb-4">
        Create and manage your advertising campaigns, monitor performance, and control your budget.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Active Campaigns</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">3</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Total Impressions</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">24,578</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Total Clicks</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">1,245</div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserDashboard;