/**
 * Unified Test Mode Implementation
 * 
 * This consolidates all test mode logic into a single, consistent system
 * that works across both frontend and backend components.
 */

import { NextApiRequest } from 'next';
import { UserRole } from '@/types/role';

export interface UnifiedTestModeUser {
  id: string;
  pubkey: string;
  isTestMode: true;
  hasAllRoles: true;
  currentRole: UserRole;
  availableRoles: UserRole[];
  isTestUser: boolean;
}

/**
 * Core test mode detection - the single source of truth
 */
export function isTestModeActive(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment
    return process.env.NODE_ENV === 'development';
  }
  
  // Client-side: check localStorage
  try {
    return localStorage.getItem('isTestMode') === 'true';
  } catch {
    return false;
  }
}

/**
 * Check if a user is a test user (has test pubkey)
 */
export function isTestUser(pubkey: string): boolean {
  return pubkey && pubkey.startsWith('pk_test_');
}

/**
 * Unified test mode check for API requests
 */
export function isTestModeRequest(req: NextApiRequest, userPubkey?: string): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasTestPubkey = userPubkey && isTestUser(userPubkey);
  
  return isDevelopment && hasTestPubkey;
}

/**
 * Create a unified test mode user object
 */
export function createTestModeUser(pubkey: string, requestedRole: UserRole = 'advertiser'): UnifiedTestModeUser {
  const availableRoles: UserRole[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
  
  return {
    id: 'test-user-id',
    pubkey,
    isTestMode: true,
    hasAllRoles: true,
    currentRole: requestedRole,
    availableRoles,
    isTestUser: true
  };
}

/**
 * Check if test mode user has permission (always true in test mode)
 */
export function hasTestModePermission(user: UnifiedTestModeUser, requiredRole: UserRole): boolean {
  return user.isTestMode && user.availableRoles.includes(requiredRole);
}

/**
 * Enable test mode (client-side)
 */
export function enableTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem('isTestMode', 'true');
    localStorage.setItem('bypass_api_calls', 'true');
    return true;
  } catch {
    return false;
  }
}

/**
 * Disable test mode (client-side)
 */
export function disableTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem('isTestMode');
    localStorage.removeItem('bypass_api_calls');
    return true;
  } catch {
    return false;
  }
}

/**
 * Log test mode access for debugging
 */
export function logTestModeAccess(userPubkey: string, requestedRole: UserRole, endpoint: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[UNIFIED TEST MODE] User ${userPubkey} accessing ${endpoint} as ${requestedRole}`);
  }
}

/**
 * Get available roles in test mode
 */
export function getTestModeRoles(): UserRole[] {
  return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
}

/**
 * Check if current environment supports test mode
 */
export function isTestModeAvailable(): boolean {
  return process.env.NODE_ENV === 'development';
}