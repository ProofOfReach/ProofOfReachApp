import React from 'react';
import '@/types/role';
import '@/hooks/useRoleAccess';

interface RoleGuardProps {
  /** 
   * The role required to view the content. 
   * If not provided, capability will be used instead.
   */
  requiredRole?: UserRole;
  
  /** 
   * The capability required to view the content.
   * If not provided, requiredRole will be used instead.
   * At least one of requiredRole or requiredCapability must be provided.
   */
  requiredCapability?: string;
  
  /** 
   * Content to show when user has permission 
   */
  children: React.ReactNode;
  
  /** 
   * Optional content to show when user doesn't have permission 
   */
  fallback?: React.ReactNode;
}

/**
 * RoleGuard Component
 * 
 * Conditionally renders content based on user's role or capabilities.
 * 
 * @example
 * // Using role-based check
 * <RoleGuard requiredRole="admin">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * // Using capability-based check
 * <RoleGuard requiredCapability="manageUsers">
 *   <UserManagement />
 * </RoleGuard>
 * 
 * @example
 * // With fallback content
 * <RoleGuard requiredRole="publisher" fallback={<AccessDeniedMessage />}>
 *   <PublisherDashboard />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  requiredCapability,
  children,
  fallback = null
}) => {
  const { checkRole, hasCapability } = useRoleAccess();
  
  // Validate that at least one requirement is provided
  if (!requiredRole && !requiredCapability) {
    console.warn('RoleGuard: Either requiredRole or requiredCapability must be provided');
    return null;
  }
  
  // Check if user has the required role
  if (requiredRole) {
    const result = checkRole(requiredRole);
    if (!result.isAllowed) {
      return <>{fallback}</>;
    }
  }
  
  // Check if user has the required capability
  if (requiredCapability) {
    if (!hasCapability(requiredCapability)) {
      return <>{fallback}</>;
    }
  }
  
  // User has permission, render the children
  return <>{children}</>;
};

export default RoleGuard;