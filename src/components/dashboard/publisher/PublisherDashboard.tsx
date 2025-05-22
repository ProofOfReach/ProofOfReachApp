import React from 'react';

const PublisherDashboard = () => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
        Publisher Dashboard
      </h3>
      <p className="text-green-700 dark:text-green-400 mb-4">
        Manage your ad spaces, review earnings, and customize content preferences.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Active Ad Spaces</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">2</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Earnings (sats)</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">15,420</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Fill Rate</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">92%</div>
        </div>
      </div>
    </div>
  );
};

export default PublisherDashboard;