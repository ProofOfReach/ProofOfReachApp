import { useAuthSwitch } from './useAuthSwitch';
import type { UserRole } from '../types/auth';

/**
 * Hook that checks if the current user has a specific role.
 * 
 * @param role The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function useHasRole(role: string): boolean {
  const { hasRole } = useAuthSwitch();
  return hasRole(role);
}

/**
 * Hook that checks if the current user has the advertiser role.
 * 
 * @returns Boolean indicating if the user is an advertiser
 */
export function useIsAdvertiser(): boolean {
  return useHasRole('advertiser');
}

/**
 * Hook that checks if the current user has the publisher role.
 * 
 * @returns Boolean indicating if the user is a publisher
 */
export function useIsPublisher(): boolean {
  return useHasRole('publisher');
}

/**
 * Hook that checks if the current user has the admin role.
 * 
 * @returns Boolean indicating if the user is an admin
 */
export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

/**
 * Hook that checks if the current user has the stakeholder role.
 * 
 * @returns Boolean indicating if the user is a stakeholder
 */
export function useIsStakeholder(): boolean {
  return useHasRole('stakeholder');
}

/**
 * Hook that checks if the current user is authenticated.
 * 
 * @returns Boolean indicating if the user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthSwitch();
  return isAuthenticated;
}