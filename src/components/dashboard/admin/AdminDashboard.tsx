import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
        Admin Dashboard
      </h3>
      <p className="text-purple-700 dark:text-purple-400 mb-4">
        Monitor platform activity, manage users, and review content approvals.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Total Users</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">378</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Pending Approvals</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">12</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <div className="font-semibold mb-1">Platform Health</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">Good</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;