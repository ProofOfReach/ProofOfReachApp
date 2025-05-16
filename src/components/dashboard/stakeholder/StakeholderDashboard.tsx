import React from 'react';

const StakeholderDashboard = () => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
        Stakeholder Dashboard
      </h3>
      <p className="text-emerald-700 dark:text-emerald-400 mb-4">
        Review platform performance, analyze key metrics, and track growth trends.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Platform Revenue</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">1.2M sats</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Monthly Growth</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">28%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">User Retention</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">85%</div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDashboard;