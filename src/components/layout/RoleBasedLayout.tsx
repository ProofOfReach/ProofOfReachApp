import React, { ReactNode, useEffect, useState } from 'react';
import { useEnhancedRole } from '../../context/EnhancedRoleContext';
import { RoleType } from '../../lib/enhancedRoleService';
import { logger } from '../../lib/logger';

// Define component props
interface RoleBasedLayoutProps {
  // The different layouts or content for each role
  children: ReactNode;
  // Fallback component to render if no matching role is found
  fallback?: ReactNode;
  // Which roles can view this layout component
  allowedRoles?: Array<RoleType | 'viewer'>;
  // Whether layout change should happen without reloading
  isFluid?: boolean;
  // ID for test/debug purposes
  id?: string;
}

/**
 * A component that renders different content based on the user's role
 * This is useful for layouts that need to adapt to the user's permissions
 */
export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({
  children,
  fallback = <div>Access denied. You don't have the required role to view this content.</div>,
  allowedRoles = ['viewer', 'admin', 'advertiser', 'publisher', 'developer', 'stakeholder'],
  isFluid = true,
  id = 'role-based-layout'
}) => {
  const { currentRole, isLoading } = useEnhancedRole();
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  
  // Check if the current role is allowed
  const isAllowed = allowedRoles.includes(currentRole);

  // Effect to handle fluid transitions between layouts
  useEffect(() => {
    if (isLoading) {
      // Don't update while loading
      return;
    }

    if (isFluid) {
      // For fluid transitions, immediately update
      setShouldRender(isAllowed);
    } else {
      // For hard transitions, handle with a page reload
      if (isAllowed) {
        setShouldRender(true);
      } else {
        // Redirect or reload if needed
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
  }, [currentRole, isLoading, isAllowed, isFluid]);

  // While loading, render nothing or a loader
  if (isLoading) {
    return <div className="loading-container">Loading role information...</div>;
  }

  // Render the appropriate content based on the role
  return (
    <div 
      data-testid={`${id}-${currentRole}`}
      className={`role-based-layout role-${currentRole}`}
    >
      {shouldRender ? children : fallback}
    </div>
  );
};

/**
 * A component that renders content only for specific roles
 * This is a simplified version of RoleBasedLayout for single-role use cases
 */
export const RoleRestricted: React.FC<{
  children: ReactNode;
  allowedRoles: Array<RoleType | 'viewer'>;
  fallback?: ReactNode;
}> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { currentRole, isLoading } = useEnhancedRole();
  
  if (isLoading) {
    return null;
  }
  
  if (allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};