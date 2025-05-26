import React from 'react';

const StakeholderDashboard: React.FC = () => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
      <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-300 mb-4">
        Stakeholder Dashboard
      </h2>
      <p className="text-emerald-700 dark:text-emerald-400 mb-4">
        Review platform performance, analyze key metrics, and track growth trends.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Platform Revenue</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">1.2M sats</div>
          <div className="text-sm text-gray-600">Total earned</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Monthly Growth</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">28%</div>
          <div className="text-sm text-gray-600">User acquisition</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Network Health</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">Excellent</div>
          <div className="text-sm text-gray-600">Overall status</div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderDashboard;