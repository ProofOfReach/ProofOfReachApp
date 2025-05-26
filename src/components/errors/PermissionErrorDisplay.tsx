/**
 * Permission Error Display Component for Nostr Ad Marketplace
 *
 * This component provides a specialized display for authorization and permission errors
 * with guidance on how to resolve access issues.
 * Part of the Phase 2 error handling infrastructure implementation.
 */

import React from 'react';
import { Lock, ExternalLink } from 'react-feather';
import Link from 'next/link';

interface PermissionErrorDisplayProps {
  className?: string;
  message?: string;
  code?: string;
  requiredRole?: string;
  requiredPermission?: string;
  loginUrl?: string;
  showLoginLink?: boolean;
  customAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * PermissionErrorDisplay component
 * 
 * Displays authorization and permission errors with clear guidance on resolution
 */
const PermissionErrorDisplay: React.FC<PermissionErrorDisplayProps> = ({
  className = '',
  message,
  code,
  requiredRole,
  requiredPermission,
  loginUrl = '/login',
  showLoginLink = true,
  customAction
}) => {
  // Determine the appropriate message based on the context
  const errorMessage = React.useMemo(() => {
    if (message) return message;
    
    if (requiredPermission) {
      return `You don't have the required permission (${requiredPermission}) to perform this action.`;
    }
    
    if (requiredRole) {
      return `You need ${requiredRole} role to access this resource.`;
    }
    
    // Default unauthorized message
    return 'You don\'t have permission to perform this action.';
  }, [message, requiredRole, requiredPermission]);

  // Additional info based on error code
  const errorDetail = React.useMemo(() => {
    if (!code) return null;
    
    switch (code) {
      case 'UNAUTHENTICATED':
        return 'You need to log in to continue.';
      case 'INSUFFICIENT_ROLE':
        return 'Your current role doesn\'t have sufficient privileges.';
      case 'EXPIRED_SESSION':
        return 'Your session has expired. Please log in again.';
      case 'ACCOUNT_LOCKED':
        return 'Your account has been temporarily locked.';
      default:
        return null;
    }
  }, [code]);

  return (
    <div className={`rounded-md bg-purple-50 dark:bg-purple-900/20 p-4 my-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Lock className="h-5 w-5 text-purple-400 dark:text-purple-300" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
            Access Denied
          </h3>
          <div className="mt-2 text-sm text-purple-700 dark:text-purple-200">
            <p>{errorMessage}</p>
            
            {errorDetail && (
              <p className="mt-1">{errorDetail}</p>
            )}
            
            <div className="mt-4">
              {showLoginLink && (code === 'UNAUTHENTICATED' || code === 'EXPIRED_SESSION') && (
                <Link 
                  href={loginUrl}
                  className="inline-flex items-center mr-4 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Log In
                </Link>
              )}
              
              {customAction && (
                customAction.onClick ? (
                  <button
                    type="button"
                    onClick={customAction.onClick}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {customAction.label}
                  </button>
                ) : (
                  <Link
                    href={customAction.href || '#'}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {customAction.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionErrorDisplay;
export { PermissionErrorDisplay };