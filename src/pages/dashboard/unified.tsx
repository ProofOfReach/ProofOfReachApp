import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Home, ShoppingBag, Upload, Shield, Briefcase, User } from 'react-feather';

import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import { RoleService } from '@/lib/roleService';
import { UserRole } from '@/context/RoleContext';

// Import our various role-specific dashboard components
import UserDashboardComponent from '@/components/dashboard/user/UserDashboard';
// Component imports would go here in a real implementation
// import AdvertiserDashboardComponent from '@/components/dashboard/advertiser/AdvertiserDashboard';
// import PublisherDashboardComponent from '@/components/dashboard/publisher/PublisherDashboard';
// etc.

/**
 * A unified dashboard that shows the appropriate content based on the current role
 * This showcases the power of our improved role management system
 */
const UnifiedDashboard: NextPage = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  
  // Initialize and listen for role changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get initial role
    const role = RoleService.getCurrentRole();
    if (role) {
      setCurrentRole(role);
    }
    
    // Listen for role changes
    const handleRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
      }>;
      setCurrentRole(customEvent.detail.to as UserRole);
    };
    
    document.addEventListener('roleSwitched', handleRoleChange);
    
    return () => {
      document.removeEventListener('roleSwitched', handleRoleChange);
    };
  }, []);
  
  // Determine what icon to show based on role
  const getRoleIcon = () => {
    switch(currentRole) {
      case 'advertiser':
        return <ShoppingBag className="h-8 w-8 text-blue-500" />;
      case 'publisher':
        return <Upload className="h-8 w-8 text-green-500" />;
      case 'admin':
        return <Shield className="h-8 w-8 text-red-500" />;
      case 'stakeholder':
        return <Briefcase className="h-8 w-8 text-purple-500" />;
      default:
        return <User className="h-8 w-8 text-blue-500" />;
    }
  };
  
  // Get the role-specific title
  const getRoleTitle = () => {
    return `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard`;
  };
  
  // Render the appropriate dashboard based on the current role
  const renderDashboard = () => {
    switch(currentRole) {
      case 'advertiser':
        // In a full implementation, we'd render the AdvertiserDashboard component
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advertiser Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This is where the advertiser-specific dashboard would be displayed.
              In a complete implementation, this would include:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>Campaign performance metrics</li>
              <li>Active and paused ads</li>
              <li>Budget utilization</li>
              <li>Conversion tracking</li>
            </ul>
          </div>
        );
      case 'publisher':
        // In a full implementation, we'd render the PublisherDashboard component
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Publisher Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This is where the publisher-specific dashboard would be displayed.
              In a complete implementation, this would include:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>Ad revenue metrics</li>
              <li>Ad space performance</li>
              <li>Pending ad approvals</li>
              <li>Content monetization stats</li>
            </ul>
          </div>
        );
      case 'admin':
        // In a full implementation, we'd render the AdminDashboard component
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Admin Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This is where the admin-specific dashboard would be displayed.
              In a complete implementation, this would include:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>Platform usage metrics</li>
              <li>User management</li>
              <li>Content moderation queue</li>
              <li>System health indicators</li>
            </ul>
          </div>
        );
      case 'stakeholder':
        // In a full implementation, we'd render the StakeholderDashboard component
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stakeholder Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This is where the stakeholder-specific dashboard would be displayed.
              In a complete implementation, this would include:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>Platform growth metrics</li>
              <li>Revenue and transaction volume</li>
              <li>User acquisition and retention</li>
              <li>Market share and competitive analysis</li>
            </ul>
          </div>
        );
      default:
        // For 'user' role, use our existing component
        return <UserDashboardComponent />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        {getRoleIcon()}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getRoleTitle()}</h1>
      </div>
      
      {/* Render role-specific dashboard content */}
      {renderDashboard()}
      
      {/* Common dashboard components that show up for all roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a 
              href="/dashboard/role-switcher" 
              className="block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
            >
              Switch Roles
            </a>
            <a 
              href="/dashboard/profile" 
              className="block px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
            >
              Edit Profile
            </a>
            <a 
              href="/dashboard/settings" 
              className="block px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
            >
              Account Settings
            </a>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Role:</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-medium capitalize">
                {currentRole}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Test Mode:</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs font-medium">
                {RoleService.isTestMode() ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Status:</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs font-medium">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Apply our improved dashboard layout
UnifiedDashboard.getLayout = (page: React.ReactElement) => {
  return <ImprovedDashboardLayout title="Dashboard">{page}</ImprovedDashboardLayout>;
};

export default UnifiedDashboard;