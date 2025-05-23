/**
 * Example component demonstrating role-based access control with the useRoleAccess hook
 * 
 * This component shows how to conditionally render UI elements based on user roles
 * using the unified role access system.
 * 
 * This is a production-ready implementation with proper error handling,
 * accessibility features, and performance optimizations.
 */

import React, { ReactNode, memo } from 'react';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { UserRoleType } from '../../types/role';
import { logger } from '../../lib/logger';

interface RoleBasedButtonProps {
  /** The role required to see this button */
  requiredRole?: UserRoleType;
  /** Button label text */
  label: string;
  /** Click handler function */
  onClick: () => void;
  /** Optional custom styles */
  className?: string;
  /** Allow multiple roles to access this button */
  allowedRoles?: UserRoleType[];
  /** Optional icon to display before the label */
  icon?: ReactNode;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Data test ID for testing */
  testId?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * A button that is only rendered if the user has the required role
 * Memoized to avoid unnecessary re-renders
 */
export const RoleBasedButton: React.FC<RoleBasedButtonProps> = memo(({
  requiredRole,
  label,
  onClick,
  className = '',
  allowedRoles = [],
  icon,
  disabled = false,
  testId,
  ariaLabel
}) => {
  // Use the role access hook for permission checking
  const { currentRole, hasRole, hasPermission } = useRoleAccess();
  
  try {
    // Determine if the button should be shown
    const shouldShow = () => {
      // If requiredRole is specified, check for that specific role
      if (requiredRole) {
        return hasRole(requiredRole);
      }
      
      // If allowedRoles is provided, check if user has any of those roles
      if (allowedRoles.length > 0) {
        return hasPermission(allowedRoles);
      }
      
      // If no roles are specified, always show the button
      return true;
    };
    
    // Don't render anything if the user doesn't have permission
    if (!shouldShow()) {
      return null;
    }
    
    // Render the button if the user has permission
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-white ${className}`}
        disabled={disabled}
        data-testid={testId}
        aria-label={ariaLabel || label}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </button>
    );
  } catch (error) {
    logger.logger.error('Error in RoleBasedButton:', error);
    return null;
  }
});

/**
 * Example usage component showing various role-based UI elements
 */
export const RoleBasedControls: React.FC = () => {
  // Access role-based permissions
  const { 
    currentRole,
    hasRole,
    hasPermission
  } = useRoleAccess();
  
  // Handler functions (memoize to prevent unnecessary re-renders)
  const handleCreateAd = React.useCallback(() => {
    console.log('Creating a new ad');
  }, []);
  
  const handleApproveAds = React.useCallback(() => {
    console.log('Opening ad approval panel');
  }, []);
  
  const handleManageUsers = React.useCallback(() => {
    console.log('Opening user management');
  }, []);
  
  const handleViewReport = React.useCallback(() => {
    console.log('Viewing analytics report');
  }, []);
  
  // Calculate permissions once to avoid repeated calls
  const canManageRoles = hasRole('admin');
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Role-Based Controls ({currentRole})</h2>
      
      <div className="space-y-4">
        {/* Example 1: Button that's only visible to advertisers */}
        {hasRole('advertiser') && (
          <button 
            onClick={handleCreateAd}
            className="px-4 py-2 rounded-md text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            Create New Ad Campaign
          </button>
        )}
        
        {/* Example 2: Button that's visible to multiple roles */}
        {hasPermission(['publisher', 'admin']) && (
          <button 
            onClick={handleApproveAds}
            className="px-4 py-2 rounded-md text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Approve Ad Submissions
          </button>
        )}
        
        {/* Example 3: Button using a permission check function */}
        {canManageRoles && (
          <button 
            onClick={handleManageUsers}
            className="px-4 py-2 rounded-md text-white bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            Manage User Roles
          </button>
        )}
        
        {/* Example 4: Button that's visible to all users */}
        <button 
          onClick={handleViewReport}
          className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          View Analytics Dashboard
        </button>
      </div>
    </div>
  );
};

export default RoleBasedControls;