/**
 * Role Normalization Utility
 * 
 * This utility provides a central place to handle the migration from 'viewer' role to 'viewer' role.
 * By centralizing the normalization, we avoid having to update every file individually.
 */

import type { UserRole } from '../types/role';

/**
 * Normalizes a role UserRole, converting legacy 'viewer' role to 'viewer'
 * This ensures backward compatibility while we transition the codebase
 * 
 * @param role The role string to normalize
 * @returns Normalized role string (UserRole)
 */
export function normalizeRole(role: string): string {
  // Convert legacy 'viewer' role to 'viewer'
  if (role === 'viewer') {
    return 'viewer';
  }
  
  // Return the role as is if it's already normalized
  return role as UserRole;
}

/**
 * Normalizes an array of roles, converting any 'viewer' roles to 'viewer'
 * 
 * @param roles Array of role strings to normalize
 * @returns Normalized array of roles
 */
export function normalizeRoles(roles: string[]): string[] {
  return roles.map(normalizeRole);
}

/**
 * Normalizes role data from storage, handling legacy role arrays and objects
 * 
 * @param data Any data structure that might contain role information
 * @returns The same data structure with normalized roles
 */
export function normalizeRoleData(data: any): any {
  if (!data) return data;
  
  // Handle arrays of roles
  if (Array.isArray(data)) {
    return normalizeRoles(data);
  }
  
  // Handle objects with role properties
  if (typeof data === 'object') {
    const result = { ...data };
    
    // Normalize currentRole if it exists
    if (result.currentRole && typeof result.currentRole === 'string') {
      result.currentRole = normalizeRole(result.currentRole);
    }
    
    // Normalize availableRoles array if it exists
    if (Array.isArray(result.availableRoles)) {
      result.availableRoles = normalizeRoles(result.availableRoles);
    }
    
    return result;
  }
  
  // Handle simple string roles
  if (typeof data === 'string') {
    return normalizeRole(data);
  }
  
  return data;
}

const roleNormalizer = {
  normalizeRole,
  normalizeRoles,
  normalizeRoleData
};