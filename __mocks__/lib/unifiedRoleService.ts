/**
 * Mock implementation of UnifiedRoleService for testing
 */

import { UserRoleType } from '../../src/types/role';

// Create mock service
const unifiedRoleService = {
  // Role management
  getUserRoles: jest.fn().mockResolvedValue(['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRoleType[]),
  getCurrentRole: jest.fn().mockReturnValue('advertiser' as UserRoleType),
  setUserRole: jest.fn().mockImplementation((userId: string, role: UserRoleType) => Promise.resolve({
    success: true,
    role
  })),
  saveCurrentRole: jest.fn().mockImplementation((role: UserRoleType) => Promise.resolve(true)),
  
  // Role validation
  validateRole: jest.fn().mockImplementation((role: UserRoleType) => true),
  validateRoles: jest.fn().mockImplementation((roles: UserRoleType[]) => roles),
  isRoleAvailable: jest.fn().mockImplementation((role: UserRoleType, availableRoles: UserRoleType[]) => true),
  
  // Role assignment and verification
  assignRoleToUser: jest.fn().mockImplementation((userId: string, role: UserRoleType) => Promise.resolve({
    success: true,
    roles: ['user', 'advertiser', 'publisher', 'admin', 'stakeholder']
  })),
  verifyUserHasRole: jest.fn().mockImplementation((userId: string, role: UserRoleType) => Promise.resolve(true)),
  
  // Role persistence
  saveRolesToLocalStorage: jest.fn().mockImplementation((roles: UserRoleType[]) => true),
  getRolesFromLocalStorage: jest.fn().mockReturnValue(['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRoleType[]),
  clearRolesFromLocalStorage: jest.fn().mockReturnValue(true),
  
  // Database operations
  saveRolesToDatabase: jest.fn().mockImplementation((userId: string, roles: UserRoleType[]) => Promise.resolve(true)),
  getRolesFromDatabase: jest.fn().mockImplementation((userId: string) => Promise.resolve(['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRoleType[])),
  
  // Test mode
  enableTestMode: jest.fn().mockResolvedValue(true),
  disableTestMode: jest.fn().mockResolvedValue(true),
  isTestModeEnabled: jest.fn().mockReturnValue(true),
  
  // Role transitions
  performRoleTransition: jest.fn().mockImplementation((currentRole: UserRoleType, newRole: UserRoleType) => Promise.resolve({
    success: true,
    previousRole: currentRole,
    newRole: newRole
  })),
  
  // Current user status helpers 
  hasRole: jest.fn().mockImplementation((role: UserRoleType) => true),
  isUserInRole: jest.fn().mockImplementation((userId: string, role: UserRoleType) => Promise.resolve(true))
};

export default unifiedRoleService;