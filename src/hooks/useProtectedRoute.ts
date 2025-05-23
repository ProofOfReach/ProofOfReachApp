import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthSwitch } from './useAuthSwitch';
import type { UserRole } from '../types/auth';
import { logger } from '../lib/logger';

/**
 * Options for the useProtectedRoute hook.
 */
interface ProtectedRouteOptions {
  /**
   * The required role(s) to access this route.
   * If multiple roles are provided, the user must have at least one of them.
   */
  requiredRoles?: UserRole | UserRole[];
  
  /**
   * Where to redirect if authentication fails.
   * Defaults to '/login'.
   */
  loginRedirect?: string;
  
  /**
   * Where to redirect if authorization fails (user is authenticated but lacks required role).
   * Defaults to '/dashboard'.
   */
  unauthorizedRedirect?: string;
  
  /**
   * Whether to bypass protection in development mode.
   * Defaults to false.
   */
  bypassInDev?: boolean;
}

/**
 * Hook to protect routes based on authentication and roles.
 * Use this at the beginning of your page components to ensure
 * only authorized users can access them.
 */
export function useProtectedRoute({
  requiredRoles,
  loginRedirect = '/login',
  unauthorizedRedirect = '/dashboard',
  bypassInDev = false
}: ProtectedRouteOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, hasRole, currentRole, isLoading } = useAuthSwitch();
  
  // Bypass protection in development mode if requested
  const isDev = process.env.NODE_ENV === 'development';
  const shouldBypass = isDev && bypassInDev;
  
  useEffect(() => {
    // Don't run during SSR or loading
    if (typeof window === 'undefined' || isLoading) {
      return;
    }
    
    // Skip protection if bypassed in dev mode
    if (shouldBypass) {
      logger.log('Bypassing route protection in development mode');
      return;
    }
    
    // Check authentication first
    if (!isAuthenticated) {
      logger.log('User not authenticated, redirecting to login');
      router.replace(loginRedirect);
      return;
    }
    
    // If no specific roles are required, any authenticated user can access
    if (!requiredRoles) {
      return;
    }
    
    // Convert single role to array for consistent handling
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check if user has any of the required roles
    const authorized = roles.some(role => hasRole(role));
    
    if (!authorized) {
      logger.log(`User lacks required role(s): ${roles.join(', ')}. Current role: ${currentRole}`);
      router.replace(unauthorizedRedirect);
    }
  }, [
    isAuthenticated, 
    hasRole, 
    currentRole, 
    requiredRoles, 
    router, 
    loginRedirect, 
    unauthorizedRedirect,
    shouldBypass,
    isLoading
  ]);
  
  return {
    isAuthenticated,
    isAuthorized: requiredRoles 
      ? Array.isArray(requiredRoles) 
        ? requiredRoles.some(role => hasRole(role))
        : hasRole(requiredRoles)
      : isAuthenticated,
    isLoading
  };
}