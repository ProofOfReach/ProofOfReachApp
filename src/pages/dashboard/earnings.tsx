import React from 'react';

const EarningsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Publisher Earnings</h1>
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        Track your earnings and performance metrics.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600">15,420 sats</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">This Month</h3>
          <p className="text-3xl font-bold text-blue-600">3,240 sats</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Last 7 Days</h3>
          <p className="text-3xl font-bold text-purple-600">890 sats</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Yesterday</h3>
          <p className="text-3xl font-bold text-orange-600">127 sats</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Earnings</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="font-semibold">Homepage Banner</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Yesterday</p>
            </div>
            <p className="font-bold text-green-600">127 sats</p>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="font-semibold">Sidebar Ad</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Yesterday</p>
            </div>
            <p className="font-bold text-green-600">89 sats</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;