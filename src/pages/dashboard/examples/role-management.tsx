/**
 * Role Management Example Page
 * 
 * This page demonstrates the use of the new unified role management system
 * with the centralized access control system and role switch capabilities.
 */

import React, { useState, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useRoleAccess } from '../../../hooks/useRoleAccess';
import RoleAwareComponent from '../../../components/examples/RoleAwareComponent';
import type { UserRole } from '../../../types/role';
import { logger } from '../../../lib/logger';

const RoleManagementPage: NextPage = () => {
  const { 
    currentRole,
    availableRoles,
    switchRole,
    capabilities
  } = useRoleAccess();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle role switch with proper loading and error states
  const handleRoleSwitch = useCallback(async (role: UserRole) => {
    if (role === currentRole) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      logger.debug(`Attempting to switch role from ${currentRole} to ${role} using redirectless navigation`);
      
      // The true parameter preserves the current path (no redirect)
      const success = await switchRole(role, true);
      
      if (success) {
        logger.info(`Successfully switched to ${role} role without page reload`);
      } else {
        logger.error(`Failed to switch to ${role} role`);
        setError(`Failed to switch to ${role} role.`);
      }
    } catch (err) {
      logger.error('Error switching roles:', err);
      setError('An unexpected error occurred while switching roles.');
    } finally {
      setIsLoading(false);
    }
  }, [currentRole, switchRole]);
  
  return (
    <>
      <Head>
        <title>Role Management Demo | Nostr Ad Marketplace</title>
      </Head>
      
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">
            Role Management Demo
          </h1>
          
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 dark:text-white">
              Current Role: <span className="font-bold">{currentRole.toUpperCase()}</span>
            </h2>
            
            <div className="mt-4">
              <p className="mb-2 text-sm dark:text-gray-300">Switch to another role:</p>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    disabled={isLoading || role === currentRole}
                    className={`
                      px-3 py-1 rounded text-sm font-medium
                      ${role === currentRole 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'}
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
              
              {isLoading && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Switching roles...
                </p>
              )}
              
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </div>
          
          {/* Demonstrate the role-aware component */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Role-Aware Component
            </h2>
            <RoleAwareComponent />
          </div>
          
          {/* Display role capabilities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Role Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(capabilities).map(([capability, isAllowed]) => (
                <div 
                  key={capability}
                  className={`
                    p-3 rounded-lg border
                    ${isAllowed 
                      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                      : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'}
                  `}
                >
                  <div className="flex items-center">
                    <span 
                      className={`
                        inline-block w-6 h-6 rounded-full mr-2 flex items-center justify-center
                        ${isAllowed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'}
                      `}
                    >
                      {isAllowed ? '✓' : '✗'}
                    </span>
                    <span className="font-medium dark:text-white">
                      {capability.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 dark:text-white">
              How This Works
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              This demo showcases the unified role management system with centralized access control:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Role switching with real-time UI updates</li>
              <li>Role-based component rendering</li>
              <li>Permission-based capability display</li>
              <li>Centralized access control system</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              The system maintains role states across page navigations and automatically restricts access to routes
              based on the user's current role.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default RoleManagementPage;