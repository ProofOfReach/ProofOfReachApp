/**
 * Role Service - Centralized service for managing user roles
 * 
 * This service provides a single point for all role-related operations
 * with enhanced error handling, validation, and logging.
 */
import { prisma } from '../prismaClient';
import { logger } from '../logger';
import { 
  UserRole, 
  RoleError, 
  RoleErrorType,
  RoleInfo,
  RolePermissions,
  UserRoleStatus
} from './types';

// Default role definitions with permissions
const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  viewer: {
    id: 'viewer',
    displayName: 'Viewer',
    description: 'Basic access to view content and ads',
    permissions: {
      viewDashboard: true,
      createAds: false,
      manageAds: false,
      monetizeContent: false,
      viewAnalytics: false,
      accessAdminPanel: false,
      viewFinancialData: false,
      viewTechnicalData: false,
      manageUsers: false,
      manageSettings: false,
      manageApiKeys: false,
    },
    uiIcon: 'eye'
  },
  advertiser: {
    id: 'advertiser',
    displayName: 'Advertiser',
    description: 'Create and manage advertising campaigns',
    permissions: {
      viewDashboard: true,
      createAds: true,
      manageAds: true,
      monetizeContent: false,
      viewAnalytics: true,
      accessAdminPanel: false,
      viewFinancialData: false,
      viewTechnicalData: false,
      manageUsers: false,
      manageSettings: false,
      manageApiKeys: true,
    },
    uiIcon: 'megaphone'
  },
  publisher: {
    id: 'publisher',
    displayName: 'Publisher',
    description: 'Monetize content through ad placements',
    permissions: {
      viewDashboard: true,
      createAds: false,
      manageAds: false,
      monetizeContent: true,
      viewAnalytics: true,
      accessAdminPanel: false,
      viewFinancialData: false,
      viewTechnicalData: false,
      manageUsers: false,
      manageSettings: false,
      manageApiKeys: true,
    },
    uiIcon: 'publish'
  },
  admin: {
    id: 'admin',
    displayName: 'Administrator',
    description: 'Full system access and control',
    permissions: {
      viewDashboard: true,
      createAds: true,
      manageAds: true,
      monetizeContent: true,
      viewAnalytics: true,
      accessAdminPanel: true,
      viewFinancialData: true,
      viewTechnicalData: true,
      manageUsers: true,
      manageSettings: true,
      manageApiKeys: true,
    },
    uiIcon: 'shield'
  },
  stakeholder: {
    id: 'stakeholder',
    displayName: 'Stakeholder',
    description: 'View business metrics and financial data',
    permissions: {
      viewDashboard: true,
      createAds: false,
      manageAds: false,
      monetizeContent: false,
      viewAnalytics: true,
      accessAdminPanel: false,
      viewFinancialData: true,
      viewTechnicalData: false,
      manageUsers: false,
      manageSettings: false,
      manageApiKeys: false,
    },
    uiIcon: 'chart'
  },
  developer: {
    id: 'developer',
    displayName: 'Developer',
    description: 'Access to technical implementation details',
    permissions: {
      viewDashboard: true,
      createAds: false,
      manageAds: false,
      monetizeContent: false,
      viewAnalytics: true,
      accessAdminPanel: false,
      viewFinancialData: false,
      viewTechnicalData: true,
      manageUsers: false,
      manageSettings: false,
      manageApiKeys: true,
    },
    uiIcon: 'code'
  }
};

// Default role when none is specified
const DEFAULT_ROLE: string = 'viewer';

/**
 * Role Service for comprehensive role management
 */
export class RoleService {
  private static instance: RoleService;

  /**
   * Get the singleton instance
   */
  public static getInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService();
    }
    return RoleService.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    logger.debug('Role service initialized');
  }

  /**
   * Get role definition by role ID
   */
  public getRoleDefinition(roleId: string): RoleInfo {
    return ROLE_DEFINITIONS[roleId] || ROLE_DEFINITIONS[DEFAULT_ROLE];
  }

  /**
   * Get all role definitions
   */
  public getAllRoleDefinitions(): Record<UserRole, RoleInfo> {
    return { ...ROLE_DEFINITIONS };
  }

  /**
   * Check if a role has a specific permission
   */
  public roleHasPermission(role: string, permission: keyof RolePermissions): boolean {
    const roleInfo = this.getRoleDefinition(role);
    return roleInfo.permissions[permission] || false;
  }

  /**
   * Get a user's roles from the database
   */
  public async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      // Get the user record to verify existence
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn(`User not found for ID: ${userId}`);
        return [DEFAULT_ROLE];
      }

      // Get roles from the UserRole table 
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: userId,
          isActive: true
        }
      });

      // Start with viewer role (everyone has it)
      const roles: string[] = ['viewer']; 

      // Add all active role records
      for (const userRole of userRoles) {
        if (!roles.includes(userRole.role as UserRole)) {
          roles.push(userRole.role as UserRole);
        }
      }

      logger.debug(`Roles for user ${userId}: ${roles.join(', ')}`);
      return roles;
    } catch (error) {
      logger.error('Error getting user roles:', error);
      return [DEFAULT_ROLE];
    }
  }

  /**
   * Get a user's current role
   */
  public async getCurrentRole(userId: string): Promise<UserRole> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn(`User not found for ID: ${userId}`);
        return DEFAULT_ROLE;
      }

      // If user has a current role set, use it
      if (user.currentRole) {
        // Validate that the user still has this role
        const availableRoles = await this.getUserRoles(userId);
        if (availableRoles.includes(user.currentRole as UserRole)) {
          return user.currentRole as UserRole;
        }
      }

      // If no valid current role, use the highest privileged available role
      const availableRoles = await this.getUserRoles(userId);
      if (availableRoles.includes('admin')) return 'admin';
      if (availableRoles.includes('advertiser')) return 'advertiser';
      if (availableRoles.includes('publisher')) return 'publisher';
      if (availableRoles.includes('stakeholder')) return 'stakeholder';
      if (availableRoles.includes('developer')) return 'developer';
      
      return DEFAULT_ROLE;
    } catch (error) {
      logger.error('Error getting current role:', error);
      return DEFAULT_ROLE;
    }
  }

  /**
   * Set a user's current role
   */
  public async setCurrentRole(userId: string, role: string): Promise<boolean> {
    try {
      // Validate the requested role
      if (!Object.keys(ROLE_DEFINITIONS).includes(role)) {
        logger.error(`Invalid role requested: ${role}`);
        return false;
      }

      // Verify the user has this role assigned
      const availableRoles = await this.getUserRoles(userId);
      if (!availableRoles.includes(role)) {
        logger.error(`User ${userId} does not have the role: ${role}`);
        return false;
      }

      // Update the user's current role
      await prisma.user.update({
        where: { id: userId },
        data: { 
          currentRole: role,
          previousRole: await this.getCurrentRole(userId), // Store the previous role
          lastRoleChange: new Date()
        }
      });

      logger.info(`User ${userId} role updated to ${role}`);
      return true;
    } catch (error) {
      logger.error(`Error setting current role to ${role}:`, error);
      return false;
    }
  }

  /**
   * Get detailed role status for a user
   */
  public async getUserRoleStatus(userId: string): Promise<Record<UserRole, UserRoleStatus>> {
    try {
      // Get user record to verify existence
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn(`User not found for ID: ${userId}`);
        return this.getDefaultRoleStatus();
      }

      // Get roles from the UserRole table
      const userRoles = await prisma.userRole.findMany({
        where: { userId: userId }
      });

      // Initialize result with default role statuses
      const result: Record<UserRole, UserRoleStatus> = this.getDefaultRoleStatus();

      // Always set viewer role to active (base role)
      result.viewer.isActive = true;

      // Update with info from UserRole records
      for (const userRole of userRoles) {
        const role = userRole.role as UserRole;
        if (result[role]) {
          result[role].isActive = userRole.isActive;
          result[role].isTestRole = userRole.isTestRole;
          result[role].assignedAt = userRole.createdAt;
        }
      }

      return result;
    } catch (error) {
      logger.error('Error getting user role status:', error);
      return this.getDefaultRoleStatus();
    }
  }

  /**
   * Check if a user has a specific role
   */
  public async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);
      return roles.includes(role);
    } catch (error) {
      logger.error(`Error checking if user has role ${role}:`, error);
      return false;
    }
  }

  /**
   * Get a user's permissions across all their roles
   */
  public async getUserPermissions(userId: string): Promise<RolePermissions> {
    try {
      const roles = await this.getUserRoles(userId);
      
      // Start with no permissions
      const permissions: RolePermissions = {
        viewDashboard: false,
        createAds: false,
        manageAds: false,
        monetizeContent: false,
        viewAnalytics: false,
        accessAdminPanel: false,
        viewFinancialData: false,
        viewTechnicalData: false,
        manageUsers: false,
        manageSettings: false,
        manageApiKeys: false,
      };

      // Combine permissions from all roles
      for (const role of roles) {
        const roleInfo = this.getRoleDefinition(role);
        Object.keys(permissions).forEach(key => {
          const permKey = key as keyof RolePermissions;
          permissions[permKey] = permissions[permKey] || roleInfo.permissions[permKey];
        });
      }

      return permissions;
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      return ROLE_DEFINITIONS[DEFAULT_ROLE].permissions;
    }
  }

  /**
   * Assign a role to a user
   */
  public async assignRole(
    userId: string, 
    role: string, 
    options: { 
      isActive?: boolean, 
      isTestRole?: boolean
    } = {}
  ): Promise<boolean> {
    try {
      // Validate the role
      if (!Object.keys(ROLE_DEFINITIONS).includes(role)) {
        logger.error(`Invalid role for assignment: ${role}`);
        return false;
      }

      // Default options
      const { isActive = true, isTestRole = false } = options;

      // Create or update the UserRole record
      await prisma.userRole.upsert({
        where: {
          id: `${userId}-${role}`
        },
        update: {
          isActive,
          isTestRole
        },
        create: {
          id: `${userId}-${role}`,
          userId,
          role,
          isActive,
          isTestRole
        }
      });

      // If this is the user's first or only role, set it as current
      if (isActive) {
        const userRoles = await prisma.userRole.findMany({
          where: { 
            userId,
            isActive: true
          }
        });
        
        if (userRoles.length === 1 || (userRoles.length > 0 && role === 'admin')) {
          await prisma.user.update({
            where: { id: userId },
            data: { 
              currentRole: role,
              lastRoleChange: new Date()
            }
          });
        }
      }

      logger.info(`Role ${role} ${isActive ? 'assigned to' : 'removed from'} user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error assigning role ${role}:`, error);
      return false;
    }
  }

  /**
   * Remove a role from a user
   */
  public async removeRole(userId: string, role: string): Promise<boolean> {
    return this.assignRole(userId, role, { isActive: false });
  }

  /**
   * Check if a user has a specific permission
   */
  public async checkPermission(userId: string, permission: keyof RolePermissions): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions[permission] || false;
    } catch (error) {
      logger.error(`Error checking permission ${permission}:`, error);
      return false;
    }
  }

  /**
   * Format standard role error
   */
  public formatError(type: RoleErrorType, message: string, status: number = 400, details?: any): RoleError {
    return {
      type,
      message,
      status,
      details
    };
  }

  /**
   * Get default role status
   */
  private getDefaultRoleStatus(): Record<UserRole, UserRoleStatus> {
    return {
      viewer: { role: 'viewer', isActive: true, isTestRole: false },
      advertiser: { role: 'advertiser', isActive: false, isTestRole: false },
      publisher: { role: 'publisher', isActive: false, isTestRole: false },
      admin: { role: 'admin', isActive: false, isTestRole: false },
      stakeholder: { role: 'stakeholder', isActive: false, isTestRole: false },
      developer: { role: 'developer', isActive: false, isTestRole: false }
    };
  }

  /**
   * Ensure UserRole records are consistent with current roles 
   * This creates any missing UserRole records based on the user's currentRole
   */
  public async syncRoleData(userId: string): Promise<boolean> {
    try {
      // Get user record
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn(`Cannot sync roles for missing user: ${userId}`);
        return false;
      }

      // Get existing roles for the user
      const existingRoles = await prisma.userRole.findMany({
        where: { userId }
      });

      // Ensure viewer role exists (everyone should have this role)
      const viewerRoleExists = existingRoles.some(role => 
        role.role === 'viewer' && role.isActive
      );

      if (!viewerRoleExists) {
        await prisma.userRole.upsert({
          where: {
            id: `${userId}-viewer`
          },
          update: {
            isActive: true
          },
          create: {
            id: `${userId}-viewer`,
            userId: userId,
            role: 'viewer',
            isActive: true,
            isTestRole: false
          }
        });
      }

      // If user has currentRole but no corresponding UserRole record, create it
      if (user.currentRole && user.currentRole !== 'viewer') {
        const hasCurrentRoleRecord = existingRoles.some(
          role => role.role === user.currentRole && role.isActive
        );

        if (!hasCurrentRoleRecord) {
          await prisma.userRole.upsert({
            where: {
              id: `${userId}-${user.currentRole}`
            },
            update: {
              isActive: true
            },
            create: {
              id: `${userId}-${user.currentRole}`,
              userId: userId,
              role: user.currentRole,
              isActive: true,
              isTestRole: false
            }
          });
        }
      }

      logger.info(`Role data synchronized for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error synchronizing role data:`, error);
      return false;
    }
  }

  /**
   * Get role details by nostrPubkey
   * This is a convenience method for API endpoints
   */
  public async getRolesByPubkey(pubkey: string): Promise<{
    availableRoles: string[];
    currentRole: string;
  }> {
    try {
      // Find the user by pubkey
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey },
      });

      if (!user) {
        logger.warn(`User not found for pubkey: ${pubkey}`);
        return {
          availableRoles: [DEFAULT_ROLE],
          currentRole: DEFAULT_ROLE
        };
      }

      // Get their roles and current role
      const availableRoles = await this.getUserRoles(user.id);
      const currentRole = await this.getCurrentRole(user.id);

      return {
        availableRoles,
        currentRole
      };
    } catch (error) {
      logger.error('Error getting roles by pubkey:', error);
      return {
        availableRoles: [DEFAULT_ROLE],
        currentRole: DEFAULT_ROLE
      };
    }
  }

  /**
   * Update current role by nostrPubkey
   * This is a convenience method for API endpoints
   */
  public async updateRoleByPubkey(pubkey: string, role: string): Promise<boolean> {
    try {
      // Find the user by pubkey
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey },
      });

      if (!user) {
        logger.warn(`User not found for pubkey: ${pubkey}`);
        return false;
      }

      // Set their current role
      return await this.setCurrentRole(user.id, role);
    } catch (error) {
      logger.error('Error updating role by pubkey:', error);
      return false;
    }
  }
}

// Export singleton instance
export const roleService = RoleService.getInstance();