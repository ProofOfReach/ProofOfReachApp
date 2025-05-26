/**
 * Role Utilities
 * Simplified role checking functions for build compatibility
 */

import { unifiedRoleService } from '../unifiedRoleService';

/**
 * Check if a user has a specific role
 * @param userId - The user ID to check
 * @param role - The role to check for
 * @returns Promise<boolean> - Whether the user has the role
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    return await unifiedRoleService.hasRole(userId, role as any);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Get all roles for a user
 * @param userId - The user ID
 * @returns Promise<string[]> - Array of role names
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    return await unifiedRoleService.getAvailableRoles();
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Simple role validation
 * @param role - Role to validate
 * @returns boolean - Whether the role is valid
 */
export function isValidRole(role: string): boolean {
  const validRoles = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
  return validRoles.includes(role);
}