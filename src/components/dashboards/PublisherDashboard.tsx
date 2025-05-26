import React from 'react';

const PublisherDashboard: React.FC = () => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
      <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4">
        Publisher Dashboard
      </h2>
      <p className="text-green-700 dark:text-green-400 mb-4">
        Welcome to your publisher dashboard. Here you can manage your ad spaces,
        track earnings, and review performance metrics.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Active Ad Spaces</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">3</div>
          <div className="text-sm text-gray-600">Across your sites</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Earnings</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">485 sats</div>
          <div className="text-sm text-gray-600">Last 7 days</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Fill Rate</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">78%</div>
          <div className="text-sm text-gray-600">Average fill rate</div>
        </div>
      </div>
    </div>
  );
};

export default PublisherDashboard;