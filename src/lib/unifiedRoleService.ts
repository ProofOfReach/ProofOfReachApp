/**
 * Unified Role Service
 * 
 * This service provides a centralized way to manage and verify user roles
 * across the application. It serves as the single source of truth for role
 * management functionality.
 * 
 * Features:
 * - Persistent role storage (localStorage + server)
 * - Role verification
 * - Permission checking
 * - Role transition handling
 */

import { logger } from './logger';
import { UserRole, isValidUserRole, getDefaultRole } from '../types/role';
import { prisma } from './prisma';
import { normalizeRole, normalizeRoles, normalizeRoleData } from '../utils/roleNormalizer';

// Type definitions
export interface RoleServiceConfig {
  /** Base URL for API requests */
  apiUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Default role if none is set */
  defaultRole?: string;
  /** Storage key for local storage */
  storageKey?: string;
}

export interface RoleData {
  /** Currently active role */
  currentRole: string;
  /** Roles available to this user */
  availableRoles: string[];
  /** Timestamp of when this data was last updated */
  timestamp: number;
}

/**
 * Default configuration for the role service
 */
const DEFAULT_CONFIG: RoleServiceConfig = {
  apiUrl: '/api/enhanced-roles',
  debug: false,
  defaultRole: 'viewer',
  storageKey: 'nostr_ads_role_data'
};

/**
 * Unified Role Service class
 */
export class UnifiedRoleService {
  private config: Required<RoleServiceConfig>;
  private cache: RoleData | null = null;
  private roleCache: Record<UserRole, UserRole[]> = {};
  
  /**
   * Create a new UnifiedRoleService instance
   */
  constructor(config: RoleServiceConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    } as Required<RoleServiceConfig>;
    
    // Initialize the cache from local storage if available
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }
  
  /**
   * Log debug messages if debug mode is enabled
   */
  private debug(message: UserRole, data?: any): void {
    if (this.config.debug) {
      logger.info(`[UnifiedRoleService] ${message}`, data);
    }
  }
  
  /**
   * Load role data from local storage
   */
  private loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem(this.config.storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.cache = this.validateRoleData(parsedData);
      }
    } catch (error) {
      logger.log('Error loading role data from storage:', error);
      // Invalidate the cache on error
      this.cache = null;
    }
  }
  
  /**
   * Save role data to local storage
   */
  private saveToStorage(data: RoleData): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      logger.log('Error saving role data to storage:', error);
    }
  }
  
  /**
   * Validate role data to ensure it has the correct structure
   * and all role values are valid UserRole values
   */
  private validateRoleData(data: any): RoleData {
    // Check if the structure is valid
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid role data: not an object');
    }
    
    if (!Array.isArray(data.availableRoles)) {
      throw new Error('Invalid role data: availableRoles is not an array');
    }
    
    if (typeof data.currentRole !== 'string') {
      throw new Error('Invalid role data: currentRole is not a string');
    }
    
    if (typeof data.timestamp !== 'number') {
      throw new Error('Invalid role data: timestamp is not a number');
    }
    
    // Normalize the current role (convert 'viewer' to 'viewer')
    data.currentRole = normalizeRole(data.currentRole);
    
    // Check if the current role is valid
    if (!isValidUserRole(data.currentRole)) {
      this.debug(`Invalid current role: ${data.currentRole}, falling back to default`);
      data.currentRole = this.config.defaultRole;
    }
    
    // Normalize and filter roles from availableRoles
    data.availableRoles = normalizeRoles(data.availableRoles).filter((role: string) => 
      isValidUserRole(role)
    );
    
    return {
      currentRole: data.currentRole as UserRole,
      availableRoles: data.availableRoles as UserRole[],
      timestamp: data.timestamp
    };
  }
  
  /**
   * Create default role data
   */
  private createDefaultRoleData(): RoleData {
    return {
      currentRole: this.config.defaultRole,
      availableRoles: [this.config.defaultRole],
      timestamp: Date.now()
    };
  }
  
  /**
   * Get current role data
   */
  public getRoleData(): RoleData {
    if (!this.cache) {
      this.debug('No cached role data, using default');
      return this.createDefaultRoleData();
    }
    return this.cache;
  }
  
  /**
   * Set new role data
   */
  public setRoleData(data: RoleData): void {
    try {
      const validatedData = this.validateRoleData(data);
      this.cache = validatedData;
      this.saveToStorage(validatedData);
      this.debug('Role data updated', validatedData);
    } catch (error) {
      logger.log('Error setting role data:', error);
      throw error;
    }
  }
  
  /**
   * Get roles available to a specific user
   * 
   * @param userId User ID
   * @param forceRefresh Whether to force refresh from database
   * @returns Promise resolving to array of roles
   */
  public async getUserRoles(userId: UserRole, forceRefresh = false): Promise<UserRole[]> {
    try {
      // Test mode users have all roles
      if (userId.startsWith('pk_test_')) {
        return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      }
      
      // Check if we have a cached version and aren't forcing a refresh
      if (!forceRefresh && this.roleCache[userId]) {
        this.debug(`Using memory-cached roles for ${userId}`);
        return [...this.roleCache[userId]];
      }
      
      // Get user with their roles from database
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        include: {
          UserRole: {
            where: {
              isActive: true
            },
            select: {
              role: true
            }
          }
        }
      });
      
      if (!user) {
        this.debug(`User ${userId} not found, returning default role only`);
        return [this.config.defaultRole];
      }
      
      // Always include viewer role as a base role
      const roles: string[] = ['viewer'];
      
      // Add all active roles from UserRole table
      if (user.UserRole && user.UserRole.length > 0) {
        user.UserRole.forEach(roleRecord => {
          const normalizedRole = normalizeRole(roleRecord.role) as UserRole;
          if (!roles.includes(normalizedRole) && isValidUserRole(normalizedRole)) {
            roles.push(normalizedRole);
          }
        });
      }
      
      // Normalize the current role if it's set in the user record
      if (user.currentRole) {
        const normalizedCurrentRole = normalizeRole(user.currentRole) as UserRole;
        if (isValidUserRole(normalizedCurrentRole) && !roles.includes(normalizedCurrentRole)) {
          roles.push(normalizedCurrentRole);
        }
      }
      
      // Cache the roles in memory for future use
      this.roleCache[userId] = [...roles];
      this.debug(`Cached roles for ${userId} in memory`);
      
      return roles;
    } catch (error) {
      logger.log('Error getting user roles:', error);
      return [this.config.defaultRole];
    }
  }
  
  /**
   * Check if a user has a specific role - overloaded for both local and server contexts
   * @param roleOrUserId Either a role to check locally, or a userId to check on the server
   * @param roleParam If provided, check if userId has this role on the server
   * @returns Boolean (sync) or Promise<boolean> (async) depending on context
   */
  public hasRole(roleOrUserId: UserRole, roleParam?: string): boolean | Promise<boolean> {
    // If the second parameter is provided, this is the server version
    if (roleParam) {
      return this.hasRoleOnServer(roleOrUserId, roleParam);
    }

    // Otherwise, treat the first parameter as a role and use local context
    return this.hasRoleInLocalContext(roleOrUserId as UserRole);
  }
  
  /**
   * Check if current user has a specific role (local context version)
   */
  private hasRoleInLocalContext(role: string): boolean {
    // Normalize the role (convert 'viewer' to 'viewer')
    const normalizedRole = normalizeRole(role) as UserRole;
    
    const data = this.getRoleData();
    // Make sure we normalize the currentRole for comparison as well
    const normalizedCurrentRole = normalizeRole(data.currentRole) as UserRole;
    
    return normalizedCurrentRole === normalizedRole;
  }
  
  /**
   * Check if a user has a specific role (server version)
   * 
   * @param userId User ID
   * @param role Role to check
   * @returns Promise resolving to boolean
   */
  private async hasRoleOnServer(userId: UserRole, role: string): Promise<boolean> {
    // Normalize the role (convert 'viewer' to 'viewer')
    const normalizedRole = normalizeRole(role) as UserRole;
    
    // Validate role
    if (!isValidUserRole(normalizedRole)) {
      return false;
    }
    
    // Get available roles (directly check, don't use hasRole to avoid recursion)
    const roles = await this.getUserRoles(userId);
    return roles.includes(normalizedRole);
  }
  
  /**
   * Update a user's role assignments
   * 
   * @param userId User ID
   * @param addRoles Roles to add
   * @param removeRoles Roles to remove
   * @returns Promise resolving to log status
   */
  public async updateUserRoles(
    userId: UserRole,
    addRoles: string[] = [],
    removeRoles: string[] = []
  ): Promise<boolean> {
    try {
      // Validate input
      if (!userId) {
        return false;
      }
      
      // Normalize the roles (convert 'viewer' to 'viewer')
      const normalizedAddRoles = addRoles.map(role => normalizeRole(role)) as UserRole[];
      const normalizedRemoveRoles = removeRoles.map(role => normalizeRole(role)) as UserRole[];
      
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return false;
      }
      
      // Add roles - create UserRole entries for each role to add
      for (const role of normalizedAddRoles) {
        // Skip if the role is already added
        const existingRole = await prisma.userRole.findFirst({
          where: {
            userId,
            role: role
          }
        });
        
        if (existingRole) {
          // If the role exists but is inactive, reactivate it
          if (!existingRole.isActive) {
            await prisma.userRole.update({
              where: { id: existingRole.id },
              data: { isActive: true }
            });
          }
        } else {
          // Create a new role entry
          await prisma.userRole.create({
            data: {
              userId,
              role: role,
              isActive: true
            }
          });
        }
      }
      
      // Remove roles - set isActive to false for each role to remove
      for (const role of normalizedRemoveRoles) {
        const existingRole = await prisma.userRole.findFirst({
          where: {
            userId,
            role: role,
            isActive: true
          }
        });
        
        if (existingRole) {
          await prisma.userRole.update({
            where: { id: existingRole.id },
            data: { isActive: false }
          });
        }
      }
      
      // Update user's current role if it was removed
      if (normalizedRemoveRoles.includes(user.currentRole as UserRole)) {
        // Set to default role
        await prisma.user.update({
          where: { id: userId },
          data: { 
            currentRole: this.config.defaultRole,
            previousRole: user.currentRole
          }
        });
      }
      
      return true;
    } catch (error) {
      logger.log('Error updating user roles:', error);
      return false;
    }
  }

  /**
   * Update just the current role - overloaded for both local and server contexts
   * @param userIdOrRole Either a role to set locally, or a userId to set on the server
   * @param roleParam If provided, set this role as current for the userId on the server
   * @returns Boolean (sync) or Promise<boolean> (async) depending on context
   */
  public setCurrentRole(userIdOrRole: UserRole, roleParam?: string): boolean | Promise<boolean> {
    // If second parameter is provided, this is the async server version
    if (roleParam) {
      return this.setCurrentRoleOnServer(userIdOrRole, roleParam);
    }
    
    // Otherwise, this is the sync local context version
    return this.setCurrentRoleInLocalContext(userIdOrRole as UserRole);
  }
  
  /**
   * Update just the current role for a user on the server
   * 
   * @param userId User ID
   * @param role Role to set as current
   * @returns Promise resolving to log status
   */
  private async setCurrentRoleOnServer(userId: UserRole, role: string): Promise<boolean> {
    try {
      // Normalize the role (convert 'viewer' to 'viewer')
      const normalizedRole = normalizeRole(role);
      
      // For local state management, update the current context
      if (!userId || !isValidUserRole(normalizedRole as UserRole)) {
        return false;
      }
      
      // Check if user has this role
      const hasThisRole = await this.hasRole(userId, normalizedRole as UserRole);
      if (!hasThisRole) {
        this.debug(`User ${userId} does not have role ${normalizedRole}`);
        return false;
      }
      
      // Get user with preferences
      const user = await prisma.user.findFirst({
        where: { id: userId },
        include: { preferences: true }
      });
      
      if (!user) {
        return false;
      }
      
      // Update or create preferences
      if (user.preferences) {
        await prisma.userPreferences.update({
          where: { userId },
          data: { currentRole: role }
        });
      } else {
        await prisma.userPreferences.create({
          data: {
            userId,
            currentRole: role
          }
        });
      }
      
      // Also update the local context state if applicable
      if (typeof window !== 'undefined') {
        const currentData = this.getRoleData();
        const newData = {
          ...currentData,
          currentRole: role,
          timestamp: Date.now()
        };
        this.setRoleData(newData);
      }
      
      return true;
    } catch (error) {
      logger.log('Error setting current role on server:', error);
      return false;
    }
  }
  
  /**
   * Update just the current role for the local context
   */
  public setCurrentRoleInLocalContext(role: string): boolean {
    try {
      // Normalize the role (convert 'viewer' to 'viewer')
      const normalizedRole = normalizeRole(role);
      
      const currentData = this.getRoleData();
      
      // Check if the normalized role is available for this user
      if (!currentData.availableRoles.includes(normalizedRole as UserRole)) {
        this.debug(`Role ${normalizedRole} is not available for this user`);
        return false;
      }
      
      const newData = {
        ...currentData,
        currentRole: normalizedRole as UserRole,
        timestamp: Date.now()
      };
      
      this.setRoleData(newData);
      return true;
    } catch (error) {
      logger.log('Error setting current role in local context:', error);
      return false;
    }
  }
  
  /**
   * Update the available roles
   */
  public setAvailableRoles(roles: string[]): void {
    try {
      const currentData = this.getRoleData();
      const newData = {
        ...currentData,
        availableRoles: roles,
        timestamp: Date.now()
      };
      
      // If current role is no longer available, reset to default
      if (!roles.includes(currentData.currentRole)) {
        newData.currentRole = this.config.defaultRole;
      }
      
      this.setRoleData(newData);
    } catch (error) {
      logger.log('Error setting available roles:', error);
      throw error;
    }
  }
  
  /**
   * Check if a specific role is available for the current user
   */
  public isRoleAvailable(role: string): boolean {
    const data = this.getRoleData();
    return data.availableRoles.includes(role);
  }
  
  /**
   * Check if the user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    const data = this.getRoleData();
    return roles.includes(data.currentRole);
  }
  
  /**
   * Get the current active role - overloaded for both local and server contexts
   * @param userId Optional user ID to get role from server, if not provided uses local context
   * @returns UserRole (sync) or Promise<UserRole> (async) depending on context
   */
  public getCurrentRole(userId?: string): string | Promise<UserRole> {
    if (userId) {
      return this.getCurrentRoleFromServer(userId);
    }
    
    return this.getCurrentRoleFromLocalContext();
  }
  
  /**
   * Get the current active role from local context
   */
  public getCurrentRoleFromLocalContext(): string {
    const data = this.getRoleData();
    return data.currentRole;
  }
  
  /**
   * Get the current active role for a user from the server
   */
  private async getCurrentRoleFromServer(userId: string): Promise<UserRole> {
    try {
      // For test mode users, check localStorage if available
      if (userId.startsWith('pk_test_') && typeof window !== 'undefined') {
        const testModeRole = localStorage.getItem('userRole');
        if (testModeRole && isValidUserRole(testModeRole as any)) {
          // Normalize the role (convert 'viewer' to 'viewer')
          return normalizeRole(testModeRole) as UserRole;
        }
      }
      
      // Get user with preferences
      const user = await prisma.user.findFirst({
        where: { id: userId },
        include: { preferences: true }
      });
      
      // If user has a preference, return that (with normalization)
      if (user?.preferences?.currentRole && isValidUserRole(user.preferences.currentRole as any)) {
        // Normalize the role (convert 'viewer' to 'viewer')
        return normalizeRole(user.preferences.currentRole) as UserRole;
      }
      
      // Otherwise get first available role (will already be normalized in getUserRoles)
      const roles = await this.getUserRoles(userId);
      
      // If we still don't have roles, return the default (normalized)
      return roles[0] || normalizeRole(this.config.defaultRole);
    } catch (error) {
      logger.log('Error getting current role from server:', error);
      // Return normalized default role
      return normalizeRole(this.config.defaultRole) as UserRole;
    }
  }
  
  /**
   * Get all roles available to the current user
   */
  public getAvailableRoles(): string[] {
    const data = this.getRoleData();
    return [...data.availableRoles];
  }
  
  /**
   * Clear all role data
   */
  public clearRoleData(): void {
    try {
      this.cache = this.createDefaultRoleData();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.config.storageKey);
      }
      this.debug('Role data cleared');
    } catch (error) {
      logger.log('Error clearing role data:', error);
    }
  }
  
  /**
   * Clear the in-memory cache
   * This is primarily useful for testing
   */
  public clearCache(): void {
    this.cache = null;
    this.roleCache = {};
    this.debug('Cache cleared');
  }
  
  /**
   * Sync role data with the server
   * This performs a two-way sync - it gets the latest roles from the server
   * and updates the server with the current role selection
   */
  public async syncWithServer(): Promise<RoleData> {
    try {
      const currentData = this.getRoleData();
      
      // Get the latest data from the server
      const response = await fetch(`${this.config.apiUrl}/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const serverData = await response.json();
      
      // Validate the server data
      const validatedData = this.validateRoleData({
        currentRole: serverData.currentRole || currentData.currentRole,
        availableRoles: serverData.availableRoles || currentData.availableRoles,
        timestamp: Date.now()
      });
      
      // Update local cache with server data
      this.setRoleData(validatedData);
      
      // If the current role from server is different from local, sync back to server
      if (serverData.currentRole !== currentData.currentRole && 
          validatedData.availableRoles.includes(currentData.currentRole)) {
        await this.updateServerRole(currentData.currentRole);
      }
      
      return validatedData;
    } catch (error) {
      logger.log('Error syncing with server:', error);
      return this.getRoleData();
    }
  }
  
  /**
   * Update the server with the current role selection
   */
  public async updateServerRole(role: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      logger.log('Error updating server role:', error);
      return false;
    }
  }
}

/**
 * Check if a string is a valid UserRole
 */
export const isValidRole = isValidUserRole;

// Export a singleton instance for app-wide usage
export const unifiedRoleService = new UnifiedRoleService({
  debug: process.env.NODE_ENV === 'development'
});

export default unifiedRoleService;