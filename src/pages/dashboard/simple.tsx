import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Upload, 
  Shield, 
  Briefcase, 
  User, 
  PieChart
} from 'react-feather';

/**
 * Simple working dashboard without complex dependencies
 */
const SimpleDashboard = () => {
  const [currentRole, setCurrentRole] = React.useState('viewer');

  React.useEffect(() => {
    // Set role from localStorage only on client side to avoid hydration mismatch
    const savedRole = localStorage.getItem('currentRole') || 'viewer';
    setCurrentRole(savedRole);
  }, []);

  const renderRoleContent = () => {
    switch (currentRole) {
      case 'advertiser':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Advertiser Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ShoppingBag className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Active Campaigns</h3>
                    <p className="text-gray-600">0 running</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <PieChart className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Total Spend</h3>
                    <p className="text-gray-600">0 sats</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/advertiser/campaigns" className="block p-3 bg-blue-50 rounded hover:bg-blue-100">
                  Create New Campaign
                </Link>
                <Link href="/dashboard/advertiser/analytics" className="block p-3 bg-green-50 rounded hover:bg-green-100">
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        );

      case 'publisher':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Publisher Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Upload className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Ad Spaces</h3>
                    <p className="text-gray-600">0 active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <PieChart className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Earnings</h3>
                    <p className="text-gray-600">0 sats</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/publisher/spaces" className="block p-3 bg-purple-50 rounded hover:bg-purple-100">
                  Manage Ad Spaces
                </Link>
                <Link href="/dashboard/publisher/earnings" className="block p-3 bg-yellow-50 rounded hover:bg-yellow-100">
                  View Earnings
                </Link>
              </div>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Pending Approvals</h3>
                    <p className="text-gray-600">0 ads</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-indigo-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Total Users</h3>
                    <p className="text-gray-600">0 registered</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Admin Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/admin/users" className="block p-3 bg-red-50 rounded hover:bg-red-100">
                  Manage Users
                </Link>
                <Link href="/dashboard/admin/approvals" className="block p-3 bg-indigo-50 rounded hover:bg-indigo-100">
                  Review Ad Approvals
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Nostr Ad Marketplace</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Get Started</h3>
              <p className="text-gray-600 mb-4">Choose your role to access the marketplace:</p>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    localStorage.setItem('currentRole', 'advertiser');
                    setCurrentRole('advertiser');
                  }}
                  className="block w-full p-3 bg-blue-50 rounded hover:bg-blue-100 text-left"
                >
                  <strong>Advertiser</strong> - Promote your content
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem('currentRole', 'publisher');
                    setCurrentRole('publisher');
                  }}
                  className="block w-full p-3 bg-purple-50 rounded hover:bg-purple-100 text-left"
                >
                  <strong>Publisher</strong> - Monetize your platform
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Nostr Ad Marketplace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Role: {currentRole}</span>
              <button 
                onClick={() => {
                  localStorage.setItem('currentRole', 'viewer');
                  setCurrentRole('viewer');
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Switch Role
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderRoleContent()}
      </main>
    </div>
  );
};

export default SimpleDashboard;