import React from 'react';

const AdminUsersPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        Manage platform users, roles, and permissions.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">1,247</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Active Today</h3>
          <p className="text-3xl font-bold text-green-600">89</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Publishers</h3>
          <p className="text-3xl font-bold text-purple-600">156</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Advertisers</h3>
          <p className="text-3xl font-bold text-orange-600">342</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
            <div>
              <p className="font-semibold">alice@example.com</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Publisher • Joined 2 days ago</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
          </div>
          
          <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
            <div>
              <p className="font-semibold">bob@company.com</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Advertiser • Joined 1 week ago</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;