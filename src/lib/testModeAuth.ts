import { NextApiRequest } from 'next';
import { UserRole } from '@/types/role';

/**
 * Test Mode Authentication Module
 * 
 * Following industry best practices for test mode implementations:
 * - Test mode should enable all permissions/roles
 * - Should be clearly identifiable and secure
 * - Should not affect production behavior
 */

export interface TestModeUser {
  id: string;
  pubkey: string;
  isTestMode: true;
  hasAllRoles: true;
  currentRole: UserRole;
  availableRoles: UserRole[];
}

/**
 * Checks if the request is in test mode
 * Test mode is identified by:
 * 1. Test pubkey format (pk_test_*)
 * 2. Test mode headers
 * 3. Development environment
 */
export function isTestModeRequest(req: NextApiRequest, userPubkey?: string): boolean {
  // Check for test mode indicators
  const testPubkey = userPubkey && userPubkey.startsWith('pk_test_');
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In development, always treat test pubkeys as test mode
  if (isDevelopment && testPubkey) {
    console.log(`[TEST MODE] Detected test user: ${userPubkey}`);
    return true;
  }
  
  return false;
}

/**
 * Creates a test mode user with all permissions
 * In test mode, users can assume any role and bypass restrictions
 */
export function createTestModeUser(pubkey: string, requestedRole?: UserRole): TestModeUser {
  const availableRoles: UserRole[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
  
  return {
    id: 'test-user-id',
    pubkey,
    isTestMode: true,
    hasAllRoles: true,
    currentRole: requestedRole || 'advertiser', // Default to advertiser for testing
    availableRoles
  };
}

/**
 * Checks if a test mode user has permission for a specific role
 * In test mode, all roles are always available
 */
export function hasTestModePermission(testUser: TestModeUser, requiredRole: UserRole): boolean {
  if (!testUser.isTestMode) {
    return false;
  }
  
  // In test mode, all roles are available
  return testUser.availableRoles.includes(requiredRole);
}

/**
 * Gets the effective role for a test mode user
 * This can be overridden by request headers for testing different roles
 */
export function getTestModeRole(req: NextApiRequest, defaultRole: UserRole = 'advertiser'): UserRole {
  const roleHeader = req.headers['x-test-role'] as UserRole;
  const validRoles: UserRole[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
  
  if (roleHeader && validRoles.includes(roleHeader)) {
    return roleHeader;
  }
  
  return defaultRole;
}

/**
 * Test mode authorization check
 * Returns true if the user should be granted access in test mode
 */
export function authorizeTestModeUser(
  req: NextApiRequest,
  userPubkey: string,
  requiredRole: UserRole
): boolean {
  if (!isTestModeRequest(req, userPubkey)) {
    return false;
  }
  
  const testUser = createTestModeUser(userPubkey);
  return hasTestModePermission(testUser, requiredRole);
}

/**
 * Logs test mode access for debugging
 */
export function logTestModeAccess(
  userPubkey: string,
  requestedRole: UserRole,
  endpoint: string
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[TEST MODE] User ${userPubkey} accessing ${endpoint} as ${requestedRole}`);
  }
}