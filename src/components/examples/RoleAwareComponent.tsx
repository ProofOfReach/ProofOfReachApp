/**
 * Role-Aware Component Example
 * 
 * This component demonstrates how to use the defaultUseRoleAccess hook
 * to create role-adaptive UI components. It changes its appearance
 * and behavior based on the current user's role.
 */

import React, { memo, useCallback } from 'react';
import { useRole } from '../../context/RoleContext';
import { logger } from '../../lib/logger';

interface RoleAwareComponentProps {
  /** Optional title override */
  title?: string;
  /** Optional custom styles */
  className?: string;
  /** Data test ID for testing */
  testId?: string;
}

/**
 * A component that adapts based on user role
 */
export const RoleAwareComponent: React.FC<RoleAwareComponentProps> = memo(({
  title,
  className = '',
  testId = 'role-aware-component'
}) => {
  // Use the role access hook to get role-based information
  const { 
    currentRole,
    capabilities,
    canAccess,
    isPublisher,
    isAdvertiser,
    can
  } = defaultUseRoleAccess();

  // Event handlers
  const handleAdminAction = useCallback(() => {
    logger.info('Admin action triggered');
    // Implement admin-specific functionality
  }, []);

  const handlePublisherAction = useCallback(() => {
    logger.info('Publisher action triggered');
    // Implement publisher-specific functionality
  }, []);

  const handleAdvertiserAction = useCallback(() => {
    logger.info('Advertiser action triggered');
    // Implement advertiser-specific functionality
  }, []);

  const handleGenericAction = useCallback(() => {
    logger.info('Generic action triggered');
    // Implement generic functionality
  }, []);

  // Determine component appearance based on role
  const getComponentColor = () => {
    switch (currentRole) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900';
      case 'publisher':
        return 'bg-green-100 dark:bg-green-900';
      case 'advertiser':
        return 'bg-orange-100 dark:bg-orange-900';
      case 'stakeholder':
        return 'bg-blue-100 dark:bg-blue-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  // Default title based on role if not provided
  const componentTitle = title || `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard`;

  return (
    <div 
      className={`p-4 rounded-lg shadow-md ${getComponentColor()} ${className}`}
      data-testid={testId}
    >
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        {componentTitle}
      </h2>

      <div className="space-y-4">
        {/* Role-specific content */}
        {true && (
          <div className="bg-white dark:bg-gray-700 p-3 rounded">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300">Admin Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You have full system access as an administrator.
            </p>
            {can('MANAGE_USERS') && (
              <button 
                onClick={handleAdminAction}
                className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                Manage Users
              </button>
            )}
          </div>
        )}

        {isPublisher && (
          <div className="bg-white dark:bg-gray-700 p-3 rounded">
            <h3 className="font-semibold text-green-700 dark:text-green-300">Publisher Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage your ad spaces and track earnings.
            </p>
            {can('MANAGE_AD_PLACEMENTS') && (
              <button 
                onClick={handlePublisherAction}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Manage Ad Placements
              </button>
            )}
          </div>
        )}

        {isAdvertiser && (
          <div className="bg-white dark:bg-gray-700 p-3 rounded">
            <h3 className="font-semibold text-orange-700 dark:text-orange-300">Advertiser Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Create and manage your ad campaigns.
            </p>
            {can('CREATE_ADS') && (
              <button 
                onClick={handleAdvertiserAction}
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
              >
                Create New Campaign
              </button>
            )}
          </div>
        )}

        {/* Everyone can see analytics */}
        {can('VIEW_ANALYTICS') && (
          <div className="bg-white dark:bg-gray-700 p-3 rounded">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300">Analytics Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View performance metrics and insights.
            </p>
            <button 
              onClick={handleGenericAction}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              View Analytics
            </button>
          </div>
        )}
      </div>

      {/* Role Capabilities Section */}
      <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded">
        <h3 className="font-semibold dark:text-white">Your Capabilities</h3>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          {Object.entries(capabilities).map(([key, value]) => (
            value ? (
              <li key={key} className="flex items-center">
                <span className="w-4 h-4 mr-2 text-green-500">✓</span>
                {key.replace(/can|([A-Z])/g, ' $1').trim()}
              </li>
            ) : null
          ))}
        </ul>
      </div>
    </div>
  );
});

export default RoleAwareComponent;