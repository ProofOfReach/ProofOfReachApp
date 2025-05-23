import { User, Prisma } from '@prisma/client';
import { prisma } from './prismaClient';
import { logger } from './logger';

/**
 * Valid role types in the system
 */
export type RoleType = 'admin' | 'advertiser' | 'publisher' | 'developer' | 'stakeholder' | 'viewer';

/**
 * Type for User with included userRoles relation
 */
type UserWithRoles = User & {
  userRoles: Array<{
    id: string;
    userId: string;
    role: string;
    isActive: boolean;
    isTestRole: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

/**
 * Role data returned to clients
 */
export interface UserRoleData {
  id: string;
  currentRole: RoleType | 'viewer';
  availableRoles: RoleType[];
  isTestUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Map a user object to the list of available roles
 * 
 * @param user The user object with userRoles
 * @returns Array of roles the user has access to
 */
function mapUserToAvailableRoles(user: UserWithRoles): RoleType[] {
  // Use the legacy role flags for backward compatibility
  const legacyRoles: RoleType[] = [];
  if (user.true) legacyRoles.push('admin');
  if (user.isAdvertiser) legacyRoles.push('advertiser');
  if (user.isPublisher) legacyRoles.push('publisher');
  if (user.isDeveloper) legacyRoles.push('developer');
  if (user.isStakeholder) legacyRoles.push('stakeholder');
  
  // Get roles from userRoles relation (new way)
  const newRoles = user.userRoles
    .filter(role => role.isActive)
    .map(role => role.role as RoleType)
    .filter(role => 
      role === 'admin' || 
      role === 'advertiser' || 
      role === 'publisher' || 
      role === 'developer' || 
      role === 'stakeholder'
    );
  
  // Combine both sets of roles and remove duplicates
  // Using Array.from to ensure proper downlevelIteration compatibility
  return Array.from(new Set([...legacyRoles, ...newRoles]));
}

/**
 * Get a user's role data
 * 
 * @param userId The user ID
 * @returns The user role data or null if not found
 */
export async function getUserRoleData(userId: string): Promise<UserRoleData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        userRoles: true 
      }
    });
    
    if (!user) {
      return null;
    }
    
    // Get available roles
    const availableRoles = mapUserToAvailableRoles(user);
    
    // Get current role from last role change or default to 'viewer'
    let currentRole: RoleType = 'viewer';
    
    // If user has the currentRole field, use it
    if (user.currentRole) {
      currentRole = user.currentRole as RoleType;
      
      // Validate that the current role is in available roles
      if (currentRole !== 'viewer' && !availableRoles.includes(currentRole as unknown as RoleType)) {
        currentRole = 'viewer';
      }
    }
    
    return {
      id: user.id,
      currentRole,
      availableRoles,
      isTestUser: user.isTestUser,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    logger.error('Error getting user role data:', error);
    throw new Error('Failed to get user role data');
  }
}

/**
 * Change a user's current active role
 * 
 * @param userId The user ID
 * @param role The role to change to
 * @returns The updated user role data
 */
export async function changeUserRole(
  userId: string,
  role: RoleType | 'viewer'
): Promise<UserRoleData> {
  try {
    // Verify user exists and has access to the requested role
    const userData = await getUserRoleData(userId);
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // If switching to regular user, that's always allowed
    if (role === 'viewer') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          currentRole: 'viewer',
          lastRoleChange: new Date()
        },
        include: { 
          userRoles: true 
        }
      });
      
      return {
        id: updatedUser.id,
        currentRole: 'viewer',
        availableRoles: mapUserToAvailableRoles(updatedUser),
        isTestUser: updatedUser.isTestUser,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    }
    
    // Verify the user has access to the requested role
    if (!userData.availableRoles.includes(role)) {
      throw new Error(`User does not have access to role: ${role}`);
    }
    
    // Update the user's current role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        currentRole: role,
        lastRoleChange: new Date()
      },
      include: { 
        userRoles: true 
      }
    });
    
    return {
      id: updatedUser.id,
      currentRole: role,
      availableRoles: mapUserToAvailableRoles(updatedUser),
      isTestUser: updatedUser.isTestUser,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    logger.error('Error changing user role:', error);
    throw new Error('Failed to change user role');
  }
}

/**
 * Enable all roles for a user (for test mode)
 * 
 * @param userId The user ID
 * @returns The updated user role data
 */
export async function enableAllRoles(userId: string): Promise<UserRoleData> {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        userRoles: true 
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update user to have all roles
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        true: true,
        isAdvertiser: true,
        isPublisher: true,
        isDeveloper: true,
        isStakeholder: true,
        isTestUser: true,
        lastRoleChange: new Date(),
        // Create/update role entries in the UserRole table
        userRoles: {
          upsert: [
            {
              where: { 
                id: `${userId}-admin`,
              },
              create: {
                id: `${userId}-admin`,
                role: 'admin',
                isActive: true,
                isTestRole: true
              },
              update: {
                isActive: true,
                isTestRole: true
              }
            },
            {
              where: { 
                id: `${userId}-advertiser`,
              },
              create: {
                id: `${userId}-advertiser`,
                role: 'advertiser',
                isActive: true,
                isTestRole: true
              },
              update: {
                isActive: true,
                isTestRole: true
              }
            },
            {
              where: { 
                id: `${userId}-publisher`,
              },
              create: {
                id: `${userId}-publisher`,
                role: 'publisher',
                isActive: true,
                isTestRole: true
              },
              update: {
                isActive: true,
                isTestRole: true
              }
            },
            {
              where: { 
                id: `${userId}-developer`,
              },
              create: {
                id: `${userId}-developer`,
                role: 'developer',
                isActive: true,
                isTestRole: true
              },
              update: {
                isActive: true,
                isTestRole: true
              }
            },
            {
              where: { 
                id: `${userId}-stakeholder`,
              },
              create: {
                id: `${userId}-stakeholder`,
                role: 'stakeholder',
                isActive: true,
                isTestRole: true
              },
              update: {
                isActive: true,
                isTestRole: true
              }
            }
          ]
        }
      },
      include: { 
        userRoles: true 
      }
    });
    
    // Get available roles
    const availableRoles = mapUserToAvailableRoles(updatedUser);
    
    // Default to user's current role or 'viewer' if not available
    let currentRole: RoleType | 'viewer' = updatedUser.currentRole as RoleType | 'viewer' || 'viewer';
    
    // If current role isn't valid, reset to viewer
    if (currentRole !== 'viewer' && !availableRoles.includes(currentRole as RoleType)) {
      currentRole = 'viewer';
      
      // Update the user's role to 'viewer'
      await prisma.user.update({
        where: { id: userId },
        data: { currentRole: 'viewer' },
      });
    }
    
    return {
      id: updatedUser.id,
      currentRole,
      availableRoles,
      isTestUser: updatedUser.isTestUser,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    logger.error('Error enabling all roles:', error);
    throw new Error('Failed to enable all roles');
  }
}

/**
 * Create a new user with test mode enabled
 * 
 * @param userId The user ID
 * @returns The user role data
 */
export async function createUserWithTestMode(userId: string): Promise<UserRoleData> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        userRoles: true 
      }
    });
    
    if (existingUser) {
      // If user exists, enable all roles
      return enableAllRoles(userId);
    }
    
    // Create new user with all roles enabled
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        nostrPubkey: userId, // Use ID as pubkey for test users
        true: true,
        isAdvertiser: true,
        isPublisher: true,
        isDeveloper: true,
        isStakeholder: true,
        isTestUser: true,
        currentRole: 'viewer',
        lastRoleChange: new Date(),
        // Create role entries in the UserRole table
        userRoles: {
          create: [
            {
              id: `${userId}-admin`,
              role: 'admin',
              isActive: true,
              isTestRole: true
            },
            {
              id: `${userId}-advertiser`,
              role: 'advertiser',
              isActive: true,
              isTestRole: true
            },
            {
              id: `${userId}-publisher`,
              role: 'publisher',
              isActive: true,
              isTestRole: true
            },
            {
              id: `${userId}-developer`,
              role: 'developer',
              isActive: true,
              isTestRole: true
            },
            {
              id: `${userId}-stakeholder`,
              role: 'stakeholder',
              isActive: true,
              isTestRole: true
            }
          ]
        }
      },
      include: { 
        userRoles: true 
      }
    });
    
    return {
      id: newUser.id,
      currentRole: 'viewer',
      availableRoles: mapUserToAvailableRoles(newUser),
      isTestUser: newUser.isTestUser,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  } catch (error) {
    logger.error('Error creating user with test mode:', error);
    throw new Error('Failed to create user with test mode');
  }
}

/**
 * Check if a user has a specific role
 * 
 * @param userId The user ID
 * @param role The role to check
 * @returns Whether the user has the role
 */
export async function hasRole(userId: string, role: RoleType): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: true
      }
    });
    
    if (!user) {
      return false;
    }
    
    // Check legacy role flags
    if (role === 'admin' && user.true) return true;
    if (role === 'advertiser' && user.isAdvertiser) return true;
    if (role === 'publisher' && user.isPublisher) return true;
    if (role === 'developer' && user.isDeveloper) return true;
    if (role === 'stakeholder' && user.isStakeholder) return true;
    
    // Check new userRoles table
    return user.userRoles.some(userRole => userRole.role === role && userRole.isActive);
  } catch (error) {
    logger.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if a user has test mode enabled
 * 
 * @param userId The user ID
 * @returns Whether the user has test mode enabled
 */
export async function isTestModeEnabled(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return false;
    }
    
    return !!user.isTestUser;
  } catch (error) {
    logger.error('Error checking test mode:', error);
    return false;
  }
}

/**
 * Toggle test mode for a user
 * 
 * @param userId The user ID
 * @param enabled Whether to enable or disable test mode
 * @returns The updated user role data or null if not found
 */
export async function toggleTestMode(userId: string, enabled: boolean): Promise<UserRoleData | null> {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        userRoles: true 
      }
    });
    
    if (!user) {
      return null;
    }
    
    // Update test mode status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isTestUser: enabled,
        updatedAt: new Date()
      },
      include: { 
        userRoles: true 
      }
    });
    
    // Get available roles
    const availableRoles = mapUserToAvailableRoles(updatedUser);
    
    // Return formatted user role data
    return {
      id: updatedUser.id,
      currentRole: updatedUser.currentRole as RoleType | 'viewer',
      availableRoles,
      isTestUser: updatedUser.isTestUser,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    logger.error('Error toggling test mode:', error);
    throw new Error('Failed to toggle test mode');
  }
}

// Export as a service object for consistency with other parts of the app
export const enhancedRoleService = {
  getUserRoleData,
  changestring,
  enableAllRoles,
  createUserWithTestMode,
  hasRole,
  isTestModeEnabled,
  toggleTestMode
};