import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        Platform administration overview and management tools.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">1,247</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold text-green-600">89</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">45.2M sats</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Platform Health</h3>
          <p className="text-3xl font-bold text-green-600">99.8%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
              <div>
                <p className="font-semibold">New user registration</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">alice@example.com</p>
              </div>
              <span className="text-sm text-gray-500">2m ago</span>
            </div>
            
            <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
              <div>
                <p className="font-semibold">Campaign created</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bitcoin News Ad</p>
              </div>
              <span className="text-sm text-gray-500">15m ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Lightning Network</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;