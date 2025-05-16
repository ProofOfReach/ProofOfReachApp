import { prisma } from '../lib/prisma';
import { UserRole } from '../types/auth'; // Updated to use the new location
import { User } from '../types/prisma';
import { logger } from '../lib/logger';

/**
 * Service for managing user roles using Prisma
 */
class RoleService {
  /**
   * Get the current role for a user
   * @param userId The user ID
   * @returns The current role or null if not set
   */
  async getCurrentRole(userId: string): Promise<UserRole | null> {
    try {
      const userPref = await prisma.userPreferences.findUnique({
        where: { userId }
      });
      
      return userPref?.currentRole as UserRole || null;
    } catch (error) {
      console.error('Error getting current role:', error);
      return null;
    }
  }
  
  /**
   * Set the current role for a user
   * @param userId The user ID
   * @param role The role to set
   * @returns Whether the operation was successful
   */
  async setCurrentRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      await prisma.userPreferences.upsert({
        where: { userId },
        update: { currentRole: role },
        create: { 
          userId,
          currentRole: role,
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error setting current role:', error);
      return false;
    }
  }
  
  /**
   * Get all available roles for a user
   * @param userId The user ID
   * @returns Array of available roles
   */
  async getAvailableRoles(userId: string): Promise<UserRole[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      }) as User | null;
      
      if (!user) {
        return [];
      }
      
      const roles: UserRole[] = [];
      
      // Add roles based on user flags
      if (user.isAdvertiser) roles.push('advertiser');
      if (user.isPublisher) roles.push('publisher');
      if (user.isAdmin) roles.push('admin');
      if (user.isStakeholder) roles.push('stakeholder');
      
      return roles;
    } catch (error) {
      console.error('Error getting available roles:', error);
      return [];
    }
  }
  
  /**
   * Check if a role is available for a user
   * @param userId The user ID
   * @param role The role to check
   * @returns Whether the role is available
   */
  async isRoleAvailable(userId: string, role: UserRole): Promise<boolean> {
    try {
      const roles = await this.getAvailableRoles(userId);
      return roles.includes(role);
    } catch (error) {
      console.error('Error checking if role is available:', error);
      return false;
    }
  }
  
  /**
   * Add a role to a user
   * @param userId The user ID
   * @param role The role to add
   * @returns Whether the operation was successful
   */
  async addRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const updateData: Record<string, boolean> = {};
      
      switch (role) {
        case 'advertiser':
          updateData.isAdvertiser = true;
          break;
        case 'publisher':
          updateData.isPublisher = true;
          break;
        case 'admin':
          updateData.isAdmin = true;
          break;
        case 'stakeholder':
          updateData.isStakeholder = true;
          break;
      }
      
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
      
      return true;
    } catch (error) {
      console.error('Error adding role:', error);
      return false;
    }
  }
  
  /**
   * Enable all roles for a test user
   * @param userId The user ID
   * @returns Whether the operation was successful, with user data
   */
  async enableAllRolesForTestUser(userId: string): Promise<{success: boolean, user?: any}> {
    try {
      if (!userId) {
        console.error('Cannot enable roles: No user ID provided');
        return { success: false };
      }
      
      console.log('Enabling all roles for test user...', userId);
      
      // Get the user first to ensure we have the real data
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true }
      });
      
      if (!existingUser) {
        console.error('User not found for ID:', userId);
        return { success: false };
      }
      
      // Using type-safe object to update user roles
      const updateData = {
        isAdvertiser: true,
        isPublisher: true,
        isAdmin: true,
        isStakeholder: true
      };
      
      // Update the user with all roles enabled
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { preferences: true }
      });
      
      // Ensure user preferences exist and currentRole is set
      await prisma.userPreferences.upsert({
        where: { userId: userId },
        update: {},  // No updates needed, just ensure it exists
        create: {
          userId: userId,
          currentRole: 'advertiser'  // Default role
        }
      });
      
      console.log('Successfully enabled all roles for test user.', user.id);
      
      return { 
        success: true,
        user: {
          id: user.id,
          nostrPubkey: user.nostrPubkey,
          isAdvertiser: user.isAdvertiser,
          isPublisher: user.isPublisher,
          isAdmin: user.isAdmin,
          isStakeholder: user.isStakeholder,
          currentRole: user.preferences?.currentRole || 'advertiser'
        }
      };
    } catch (error) {
      console.error('Error enabling all roles for test user:', error);
      return { success: false };
    }
  }
  
  /**
   * Get a user by Nostr pubkey
   * @param pubkey The Nostr public key 
   * @returns The user or null if not found
   */
  async getUserByPubkey(pubkey: string): Promise<any | null> {
    try {
      if (!pubkey) {
        logger.error('Cannot get user: No pubkey provided');
        return null;
      }
      
      // For test pubkeys, create a synthetic user
      if (pubkey.startsWith('pk_test_')) {
        // Return a synthetic user with default roles
        let isAdvertiser = false;
        let isPublisher = false;
        let isAdmin = false;
        let isStakeholder = false;
        
        if (pubkey === 'pk_test_advertiser') {
          isAdvertiser = true;
        } else if (pubkey === 'pk_test_publisher') {
          isPublisher = true;
        } else if (pubkey === 'pk_test_admin') {
          isAdvertiser = true;
          isPublisher = true;
          isAdmin = true;
          isStakeholder = true;
        } else {
          // Default test user gets all roles
          isAdvertiser = true;
          isPublisher = true;
          isAdmin = true;
          isStakeholder = true;
        }
        
        return {
          id: `test_id_${pubkey}`,
          nostrPubkey: pubkey,
          isAdvertiser,
          isPublisher,
          isAdmin,
          isStakeholder,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      // Query for real user
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });
      
      return user;
    } catch (error) {
      logger.error('Error getting user by pubkey:', error);
      return null;
    }
  }
  
  /**
   * Add a role to a user by pubkey
   * @param pubkey The Nostr public key
   * @param role The role to add
   * @returns Whether the operation was successful
   */
  async addRoleToUser(pubkey: string, role: UserRole): Promise<boolean> {
    try {
      if (!pubkey || !role) {
        logger.error('Cannot add role: Missing pubkey or role');
        return false;
      }
      
      // For test pubkeys, we just pretend the operation succeeded
      if (pubkey.startsWith('pk_test_')) {
        logger.log(`Added role ${role} to test user ${pubkey} (no-op)`);
        return true;
      }
      
      // First find the user
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });
      
      if (!user) {
        logger.error(`User not found for pubkey: ${pubkey}`);
        return false;
      }
      
      // Prepare the update data based on role
      const updateData: Record<string, boolean> = {};
      
      switch (role) {
        case 'advertiser':
          updateData.isAdvertiser = true;
          break;
        case 'publisher':
          updateData.isPublisher = true;
          break;
        case 'admin':
          updateData.isAdmin = true;
          break;
        case 'stakeholder':
          updateData.isStakeholder = true;
          break;
        default:
          logger.error(`Invalid role: ${role}`);
          return false;
      }
      
      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      
      logger.log(`Added role ${role} to user ${pubkey}`);
      return true;
    } catch (error) {
      logger.error('Error adding role to user:', error);
      return false;
    }
  }
  
  /**
   * Remove a role from a user by pubkey
   * @param pubkey The Nostr public key
   * @param role The role to remove
   * @returns Whether the operation was successful
   */
  async removeRoleFromUser(pubkey: string, role: UserRole): Promise<boolean> {
    try {
      if (!pubkey || !role) {
        logger.error('Cannot remove role: Missing pubkey or role');
        return false;
      }
      
      // For test pubkeys, we just pretend the operation succeeded
      if (pubkey.startsWith('pk_test_')) {
        logger.log(`Removed role ${role} from test user ${pubkey} (no-op)`);
        return true;
      }
      
      // First find the user
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });
      
      if (!user) {
        logger.error(`User not found for pubkey: ${pubkey}`);
        return false;
      }
      
      // Prepare the update data based on role
      const updateData: Record<string, boolean> = {};
      
      switch (role) {
        case 'advertiser':
          updateData.isAdvertiser = false;
          break;
        case 'publisher':
          updateData.isPublisher = false;
          break;
        case 'admin':
          updateData.isAdmin = false;
          break;
        case 'stakeholder':
          updateData.isStakeholder = false;
          break;
        default:
          logger.error(`Invalid role: ${role}`);
          return false;
      }
      
      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      
      logger.log(`Removed role ${role} from user ${pubkey}`);
      return true;
    } catch (error) {
      logger.error('Error removing role from user:', error);
      return false;
    }
  }
}

export const roleService = new RoleService();