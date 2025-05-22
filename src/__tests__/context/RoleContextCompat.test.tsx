/**
 * Tests for Role Context Compatibility Layer
 * 
 * These tests verify that the compatibility layer in RoleContext.ts
 * correctly bridges between old and new implementations.
 */

import React from 'react';
import '@testing-library/jest-dom';
import { ROLES, hasPermission, canAccessRoute, getRoleCapabilities } from '../../context/RoleContext';
import { UserRoleType } from '../../types/role';

// Direct import/test method to avoid React component rendering issues in tests
describe('RoleContext Compatibility Layer', () => {
  // Define test constants
  const advertiserRole: UserRoleType = 'advertiser';
  const adminRole: UserRoleType = 'admin';
  const publisherRole: UserRoleType = 'publisher';
  
  it('uses the correct ROLES constants', () => {
    expect(ROLES.VIEWER).toBe('viewer');
    expect(ROLES.ADVERTISER).toBe('advertiser');
    expect(ROLES.PUBLISHER).toBe('publisher');
    expect(ROLES.ADMIN).toBe('admin');
    expect(ROLES.STAKEHOLDER).toBe('stakeholder');
  });
  
  it('checks permissions correctly through the compatibility layer', () => {
    // Advertiser role permissions
    expect(hasPermission(advertiserRole, 'CREATE_ADS')).toBe(true);
    expect(hasPermission(advertiserRole, 'MANAGE_ROLES')).toBe(false);
    
    // Admin role permissions
    expect(hasPermission(adminRole, 'CREATE_ADS')).toBe(true);
    expect(hasPermission(adminRole, 'MANAGE_ROLES')).toBe(true);
    
    // Publisher role permissions
    expect(hasPermission(publisherRole, 'APPROVE_ADS')).toBe(true);
    expect(hasPermission(publisherRole, 'MANAGE_ROLES')).toBe(false);
  });
  
  it('checks route access correctly through the compatibility layer', () => {
    // Advertiser role route access
    expect(canAccessRoute(advertiserRole, '/dashboard')).toBe(true);
    expect(canAccessRoute(advertiserRole, '/dashboard/advertiser')).toBe(true);
    expect(canAccessRoute(advertiserRole, '/dashboard/admin')).toBe(false);
    
    // Admin role route access
    expect(canAccessRoute(adminRole, '/dashboard')).toBe(true);
    expect(canAccessRoute(adminRole, '/dashboard/advertiser')).toBe(true);
    expect(canAccessRoute(adminRole, '/dashboard/admin')).toBe(true);
    
    // Publisher role route access
    expect(canAccessRoute(publisherRole, '/dashboard')).toBe(true);
    expect(canAccessRoute(publisherRole, '/dashboard/publisher')).toBe(true);
    expect(canAccessRoute(publisherRole, '/dashboard/admin')).toBe(false);
  });
  
  it('provides role capabilities through the compatibility layer', () => {
    // Advertiser role capabilities
    const advertiserCapabilities = getRoleCapabilities(advertiserRole);
    expect(advertiserCapabilities.canCreateAds).toBe(true);
    expect(advertiserCapabilities.canManageOwnAds).toBe(true);
    expect(advertiserCapabilities.canApproveAds).toBe(false);
    expect(advertiserCapabilities.canManageRoles).toBe(false);
    
    // Admin role capabilities
    const adminCapabilities = getRoleCapabilities(adminRole);
    expect(adminCapabilities.canCreateAds).toBe(true);
    expect(adminCapabilities.canManageOwnAds).toBe(true);
    expect(adminCapabilities.canApproveAds).toBe(true);
    expect(adminCapabilities.canManageRoles).toBe(true);
    expect(adminCapabilities.canManageSystem).toBe(true);
    
    // Publisher role capabilities
    const publisherCapabilities = getRoleCapabilities(publisherRole);
    expect(publisherCapabilities.canCreateAds).toBe(false);
    expect(publisherCapabilities.canManageOwnAds).toBe(false);
    expect(publisherCapabilities.canApproveAds).toBe(true);
    expect(publisherCapabilities.canManageRoles).toBe(false);
  });
});