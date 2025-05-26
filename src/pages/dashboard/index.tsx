import React from 'react';
import { defaultUseRole } from '@/context/NewRoleContext';
import { UserRole } from '@/types/role';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import { getDashboardLayout } from '@/utils/layoutHelpers';

/**
 * Clean dashboard implementation that properly uses the role context
 */
const Dashboard = () => {
  // Use the proper role context
  const { role: currentRole, availableRoles, isRoleAvailable } = defaultUseRole();

  console.log(`Rendering dashboard for role: '${currentRole}' (raw: '${currentRole}')`);
  console.log('Current role value:', currentRole);
  console.log('Available roles:', availableRoles);

  // Simple role-based content rendering
  const renderRoleContent = () => {
    switch (currentRole) {
      case 'admin':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-gray-600">Manage all users and their roles</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                <p className="text-gray-600">Configure system-wide settings</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                <p className="text-gray-600">View platform analytics</p>
              </div>
            </div>
          </div>
        );

      case 'advertiser':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Advertiser Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Create Campaign</h3>
                <p className="text-gray-600">Launch new advertising campaigns</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Campaign Analytics</h3>
                <p className="text-gray-600">Track campaign performance</p>
              </div>
            </div>
          </div>
        );

      case 'publisher':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Publisher Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Ad Spaces</h3>
                <p className="text-gray-600">Manage your ad inventory</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                <p className="text-gray-600">Track your earnings</p>
              </div>
            </div>
          </div>
        );

      case 'viewer':
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Viewer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Browse Ads</h3>
                <p className="text-gray-600">View available advertisements</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Earn Rewards</h3>
                <p className="text-gray-600">Earn by engaging with content</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderRoleContent()}
        
        {/* Debug info in test mode */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Info</h3>
            <p className="text-xs text-blue-600">Current Role: {currentRole}</p>
            <p className="text-xs text-blue-600">Available Roles: {availableRoles.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Set up the layout
const DashboardWithLayout: NextPageWithLayout = Dashboard;

DashboardWithLayout.getLayout = function getLayout(page: ReactElement) {
  return getDashboardLayout(page);
};

export default DashboardWithLayout;