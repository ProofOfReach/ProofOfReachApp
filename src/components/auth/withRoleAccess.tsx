import React from 'react';
import { useRouter } from 'next/router';
import.*./lib/enhancedRoleService';
import.*./context/EnhancedRoleContext';

export interface WithRoleAccessOptions {
  // List of roles that can access this component
  allowedRoles: RoleType[];
  // Where to redirect users if they don't have access (defaults to home page)
  redirectTo?: string;
  // Whether to show loading state while checking (defaults to true)
  showLoading?: boolean;
}

/**
 * Higher-order component for role-based access control
 * Redirects users who don't have the required role
 */
export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleAccessOptions
) {
  function WithRoleAccessComponent(props: P) {
    const router = useRouter();
    const { roleData, isLoading } = useEnhancedRole();
    const { allowedRoles, redirectTo = '/', showLoading = true } = options;

    // Show loading state while role data is being fetched
    if (isLoading && showLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // Get current role or default to 'viewer'
    const currentRole = roleData?.currentRole || 'viewer';
    
    // Check if current role is in allowed roles
    const hasAccess = allowedRoles.includes(currentRole as RoleType);

    // Redirect if user doesn't have access
    if (!hasAccess) {
      // Use setTimeout to avoid immediate redirects during development
      setTimeout(() => {
        router.push(redirectTo);
      }, 100);
      
      return null;
    }

    // User has access, render the component
    return <Component {...props} />;
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithRoleAccessComponent.displayName = `withRoleAccess(${displayName})`;

  return WithRoleAccessComponent;
}