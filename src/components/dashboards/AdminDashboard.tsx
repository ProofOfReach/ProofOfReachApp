import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
      <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4">
        Admin Dashboard
      </h2>
      <p className="text-purple-700 dark:text-purple-400 mb-4">
        Monitor platform activity, manage users, and review content approvals.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Total Users</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">378</div>
          <div className="text-sm text-gray-600">Active accounts</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Pending Approvals</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">12</div>
          <div className="text-sm text-gray-600">Requiring review</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Platform Health</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">Good</div>
          <div className="text-sm text-gray-600">System status</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;