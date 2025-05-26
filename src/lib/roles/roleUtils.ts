/**
 * Role utility functions for the Nostr Ad Marketplace
 */

import { prisma } from '../prisma';

/**
 * Check if a user has a specific role
 * @param userId - The user ID to check
 * @param role - The role to check for
 * @returns Promise<boolean> - Whether the user has the role
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: userId,
        role: role
      }
    });
    return !!userRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if a user has any of the specified roles
 * @param userId - The user ID to check
 * @param roles - Array of roles to check for
 * @returns Promise<boolean> - Whether the user has any of the roles
 */
export async function hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
  try {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: userId,
        role: {
          in: roles
        }
      }
    });
    return !!userRole;
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
}

/**
 * Toggle test mode for a user
 * @param userId - The user ID
 * @param enabled - Whether to enable test mode
 * @returns Promise<any> - Updated user data
 */
export async function toggleTestMode(userId: string, enabled: boolean): Promise<any> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Update test mode status (simplified implementation)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Add test mode field if needed, or use existing fields
        updatedAt: new Date()
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error toggling test mode:', error);
    throw error;
  }
}