import React, { useEffect, useState } from 'react';
import type { NextPageWithLayout } from '../_app';
import type { UserRole } from '@/types/auth';
import RoleService from '@/lib/RoleService';

/**
 * A dedicated page for switching between roles
 * This page demonstrates the direct role management approach
 */
const RoleSwitcherPage: NextPageWithLayout = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  const [isTestMode, setIsTestMode] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Record<UserRole, boolean>>({
    user: true,
    advertiser: false,
    publisher: false,
    admin: false,
    stakeholder: false
  });
  
  // Initialize state based on RoleService
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const role = RoleService.getCurrentRole();
    if (role) {
      setCurrentRole(role);
    }
    
    const testMode = RoleService.isTestMode();
    setIsTestMode(testMode);
    
    // In a real app, we'd fetch available roles from the API
    // For now, just set them all to true in test mode
    if (testMode) {
      setAvailableRoles({
        user: true,
        advertiser: true,
        publisher: true,
        admin: true,
        stakeholder: true
      });
    }
  }, []);
  
  // Listen for role changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
  
  // Handle role change
  const handleRoleChange = async (role: string) => {
    if (currentRole === role) return;
    
    const log = await RoleService.changeRole(role);
    
    if (log) {
      setCurrentRole(role);
    }
  };
  
  // Toggle test mode
  const handleToggleTestMode = () => {
    const newTestMode = !isTestMode;
    RoleService.setTestMode(newTestMode);
    setIsTestMode(newTestMode);
    
    // In test mode, all roles are available
    if (newTestMode) {
      setAvailableRoles({
        user: true,
        advertiser: true,
        publisher: true,
        admin: true,
        stakeholder: true
      });
    } else {
      // In production mode, we'd fetch available roles from the API
      // For now, just reset to default
      setAvailableRoles({
        user: true,
        advertiser: false,
        publisher: false,
        admin: false,
        stakeholder: false
      });
    }
  };
  
  // Enable all roles
  const handleEnableAllRoles = async () => {
    const log = await RoleService.enableAllRoles();
    
    if (log) {
      setAvailableRoles({
        user: true,
        advertiser: true,
        publisher: true,
        admin: true,
        stakeholder: true
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Role Switcher</h1>
        <p className="text-gray-600">Manage your user roles</p>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Switch Roles
          </h2>
          
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This page demonstrates the new direct role management system. You can switch between roles without page refreshes.
            </p>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 dark:text-gray-200">Current Role:</span>
                <span className="px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                  {currentRole}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 dark:text-gray-200">Test Mode:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isTestMode 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  {isTestMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(availableRoles).map(([role, isAvailable]) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role as UserRole)}
                    disabled={!isAvailable || role === currentRole}
                    className={`py-3 px-4 rounded-md flex items-center justify-between 
                      ${role === currentRole
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500 dark:ring-purple-400 cursor-default'
                        : isAvailable
                          ? 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                          : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="font-medium capitalize">{role}</span>
                    {role === currentRole ? (
                      <span className="text-xs px-2 py-1 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                        Active
                      </span>
                    ) : isAvailable ? (
                      <span className="text-xs">Click to switch</span>
                    ) : (
                      <span className="text-xs">Not Available</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Developer Options
            </h3>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleToggleTestMode}
                className={`px-4 py-2 rounded-md text-sm font-medium 
                  ${isTestMode 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200' 
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200'
                  }
                `}
              >
                {isTestMode ? 'Disable Test Mode' : 'Enable Test Mode'}
              </button>
              
              <button
                onClick={handleEnableAllRoles}
                disabled={!isTestMode}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 disabled:opacity-50"
              >
                Enable All Roles
              </button>
            </div>
            
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Note: Test mode is for development purposes only and bypasses server-side role validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout will be handled by DashboardContainer

export default RoleSwitcherPage;