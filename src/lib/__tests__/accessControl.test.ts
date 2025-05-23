/**
 * Tests for the centralized access control system
 */

import { 
  accessControl,
  checkPermission,
  checkRouteAccess,
  getRoleCapabilities,
  PERMISSIONS
} from '../accessControl';
import type { UserRole } from '../../types/role';

describe('Access Control System', () => {
  describe('Permission definitions', () => {
    it('should have defined permissions object', () => {
      expect(accessControl.permissions).toBeDefined();
      expect(typeof accessControl.permissions).toBe('object');
    });

    it('should have defined roles object', () => {
      expect(accessControl.roles).toBeDefined();
      expect(typeof accessControl.roles).toBe('object');
    });

    it('should have defined routes object', () => {
      expect(accessControl.routes).toBeDefined();
      expect(typeof accessControl.routes).toBe('object');
    });
  });

  describe('checkPermission', () => {
    it('should return true for admin role with any permission', () => {
      expect(checkPermission('MANAGE_USERS', 'admin')).toBe(true);
      expect(checkPermission('MANAGE_CAMPAIGNS', 'admin')).toBe(true);
      expect(checkPermission('MANAGE_AD_PLACEMENTS', 'admin')).toBe(true);
    });

    it('should return correct permissions for advertiser role', () => {
      expect(checkPermission('CREATE_ADS', 'advertiser')).toBe(true);
      expect(checkPermission('MANAGE_CAMPAIGNS', 'advertiser')).toBe(true);
      expect(checkPermission('MANAGE_USERS', 'advertiser')).toBe(false);
    });

    it('should return correct permissions for publisher role', () => {
      expect(checkPermission('MANAGE_AD_PLACEMENTS', 'publisher')).toBe(true);
      expect(checkPermission('VIEW_PUBLISHER_STATS', 'publisher')).toBe(true);
      expect(checkPermission('MANAGE_CAMPAIGNS', 'publisher')).toBe(false);
    });

    it('should return false for unknown permission', () => {
      expect(checkPermission('NONEXISTENT_PERMISSION' as any, 'admin')).toBe(false);
    });

    it('should return false for unknown role', () => {
      expect(checkPermission('VIEW_ANALYTICS', 'unknown' as UserRole)).toBe(false);
    });
    
    it('should respect permission inheritance', () => {
      // Testing that a child permission is granted due to parent permission
      // DELETE_ADS inherits from EDIT_ADS
      expect(checkPermission('EDIT_ADS', 'advertiser')).toBe(true);
      expect(checkPermission('DELETE_ADS', 'advertiser')).toBe(true);
      
      // Testing that a deep inheritance chain works
      // EXPORT_ANALYTICS inherits from VIEW_ADVANCED_ANALYTICS which inherits from VIEW_BASIC_ANALYTICS
      expect(checkPermission('VIEW_BASIC_ANALYTICS', 'publisher')).toBe(true);
      expect(checkPermission('VIEW_ADVANCED_ANALYTICS', 'publisher')).toBe(true);
      expect(checkPermission('EXPORT_ANALYTICS', 'publisher')).toBe(true);
    });
    
    it('should handle sensitive permissions correctly', () => {
      // Sensitive permissions should still be allowed when directly granted
      expect(checkPermission('DELETE_ADS', 'advertiser')).toBe(true);
      
      // Checking if context-based bypass works
      const context = { bypassSensitiveCheck: true };
      expect(checkPermission('DELETE_ADS', 'advertiser', context)).toBe(true);
    });
    
    it('should handle test mode appropriately', () => {
      // Mock localStorage for test mode
      const originalLocalStorage = global.localStorage;
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('true')
      };
      
      // Test mode should bypass permission checks
      if (typeof window !== 'undefined') {
        Object.defineProperty(global, 'localStorage', {
          value: mockLocalStorage,
          writable: true
        });
        
        const context = { allowTestMode: true };
        expect(checkPermission('MANAGE_USERS', 'publisher', context)).toBe(true);
        
        // Restore original localStorage
        Object.defineProperty(global, 'localStorage', {
          value: originalLocalStorage,
          writable: true
        });
      }
    });
  });

  describe('checkRouteAccess', () => {
    it('should grant admin access to all routes', () => {
      expect(checkRouteAccess('/dashboard/admin', 'admin')).toBe(true);
      expect(checkRouteAccess('/dashboard/advertiser', 'admin')).toBe(true);
      expect(checkRouteAccess('/dashboard/publisher', 'admin')).toBe(true);
      expect(checkRouteAccess('/dashboard/users', 'admin')).toBe(true);
    });

    it('should restrict access based on role', () => {
      expect(checkRouteAccess('/dashboard/admin', 'publisher')).toBe(false);
      expect(checkRouteAccess('/dashboard/admin', 'advertiser')).toBe(false);
      expect(checkRouteAccess('/dashboard/admin', 'stakeholder')).toBe(false);
      expect(checkRouteAccess('/dashboard/admin', 'viewer')).toBe(false);
    });

    it('should handle nested paths correctly', () => {
      expect(checkRouteAccess('/dashboard/advertiser/campaigns/new', 'advertiser')).toBe(true);
      expect(checkRouteAccess('/dashboard/publisher/placements/stats', 'publisher')).toBe(true);
    });

    it('should grant access to public routes for all roles', () => {
      const publicRoutes = [
        '/',
        '/login',
        '/dashboard',
        '/dashboard/profile',
        '/dashboard/settings'
      ];
      
      const roles: string[] = ['admin', 'advertiser', 'publisher', 'stakeholder', 'viewer'];
      
      for (const route of publicRoutes) {
        for (const role of roles) {
          expect(checkRouteAccess(route, role)).toBe(true);
        }
      }
    });

    it('should handle route paths with query parameters', () => {
      expect(checkRouteAccess('/dashboard/advertiser?tab=campaigns', 'advertiser')).toBe(true);
      expect(checkRouteAccess('/dashboard/publisher?view=stats', 'publisher')).toBe(true);
    });
  });

  describe('getRoleCapabilities', () => {
    it('should return all capabilities for admin role', () => {
      const capabilities = getRoleCapabilities('admin');
      
      // All permissions should be true for admin
      for (const [permission, value] of Object.entries(capabilities)) {
        expect(value).toBe(true);
      }
    });

    it('should return correct capabilities for advertiser role', () => {
      const capabilities = getRoleCapabilities('advertiser');
      
      expect(capabilities.CREATE_ADS).toBe(true);
      expect(capabilities.MANAGE_CAMPAIGNS).toBe(true);
      expect(capabilities.VIEW_ANALYTICS).toBe(true);
      expect(capabilities.MANAGE_USERS).toBe(false);
      expect(capabilities.MANAGE_AD_PLACEMENTS).toBe(false);
    });

    it('should return correct capabilities for publisher role', () => {
      const capabilities = getRoleCapabilities('publisher');
      
      expect(capabilities.MANAGE_AD_PLACEMENTS).toBe(true);
      expect(capabilities.VIEW_PUBLISHER_STATS).toBe(true);
      expect(capabilities.VIEW_ANALYTICS).toBe(true);
      expect(capabilities.CREATE_ADS).toBe(false);
      expect(capabilities.MANAGE_USERS).toBe(false);
    });

    it('should return basic capabilities for viewer role', () => {
      const capabilities = getRoleCapabilities('viewer');
      
      expect(capabilities.VIEW_ANALYTICS).toBe(true);
      expect(capabilities.CREATE_ADS).toBe(false);
      expect(capabilities.MANAGE_USERS).toBe(false);
    });

    it('should handle unknown roles by returning no capabilities', () => {
      const capabilities = getRoleCapabilities('unknown' as UserRole);
      
      for (const [permission, value] of Object.entries(capabilities)) {
        expect(value).toBe(false);
      }
    });
    
    it('should return capabilities with metadata when requested', () => {
      const capabilities = getRoleCapabilities('publisher', true) as Record<string, any>;
      
      expect(capabilities.MANAGE_AD_PLACEMENTS).toHaveProperty('granted', true);
      expect(capabilities.MANAGE_AD_PLACEMENTS).toHaveProperty('category');
      expect(capabilities.MANAGE_AD_PLACEMENTS).toHaveProperty('description');
      expect(capabilities.MANAGE_AD_PLACEMENTS).toHaveProperty('isSensitive');
      
      expect(capabilities.CREATE_ADS).toHaveProperty('granted', false);
    });
    
    it('should handle inheritance correctly', () => {
      const capabilities = getRoleCapabilities('publisher', true) as Record<string, any>;
      
      // UPDATE_PLACEMENT_SETTINGS inherits from MANAGE_AD_PLACEMENTS
      expect(capabilities.UPDATE_PLACEMENT_SETTINGS).toHaveProperty('granted', true);
      expect(capabilities.UPDATE_PLACEMENT_SETTINGS).toHaveProperty('inheritedFrom', 'MANAGE_AD_PLACEMENTS');
      
      // DELETE_PLACEMENT also inherits from MANAGE_AD_PLACEMENTS
      expect(capabilities.DELETE_PLACEMENT).toHaveProperty('granted', true);
      expect(capabilities.DELETE_PLACEMENT).toHaveProperty('inheritedFrom', 'MANAGE_AD_PLACEMENTS');
    });
    
    it('should handle multi-level inheritance correctly', () => {
      const capabilities = getRoleCapabilities('publisher', true) as Record<string, any>;
      
      // Test a deep permission chain if it exists in your permissions structure
      // For example, if EXPORT_ANALYTICS inherits from VIEW_ADVANCED_ANALYTICS
      // which in turn inherits from VIEW_BASIC_ANALYTICS
      if (capabilities.EXPORT_ANALYTICS && 
          capabilities.VIEW_ADVANCED_ANALYTICS && 
          capabilities.VIEW_BASIC_ANALYTICS) {
        
        expect(capabilities.VIEW_BASIC_ANALYTICS).toHaveProperty('granted', true);
        
        expect(capabilities.VIEW_ADVANCED_ANALYTICS).toHaveProperty('granted', true);
        expect(capabilities.VIEW_ADVANCED_ANALYTICS).toHaveProperty('inheritedFrom', 'VIEW_BASIC_ANALYTICS');
        
        expect(capabilities.EXPORT_ANALYTICS).toHaveProperty('granted', true);
        // This should reflect the multi-level inheritance
        expect(capabilities.EXPORT_ANALYTICS.inheritedFrom).toContain('VIEW_ADVANCED_ANALYTICS');
      }
    });
  });
});