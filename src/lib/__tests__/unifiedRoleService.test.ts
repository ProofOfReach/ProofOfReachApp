/**
 * Tests for the Unified Role Service
 */

import { UnifiedRoleService, RoleData, unifiedRoleService } from '../unifiedRoleService';
import { UserRoleType } from '../../types/role';
import { prisma } from '../prisma';

// Mock the Prisma client
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn()
    },
    userPreferences: {
      create: jest.fn(),
      update: jest.fn()
    }
  }
}));

// Mock the logger to avoid console spam
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock localStorage for browser environment tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store
  };
})();

// Mock the fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      currentRole: 'user',
      availableRoles: ['user', 'advertiser']
    }),
    status: 200,
    statusText: 'OK'
  } as Response)
);

describe('UnifiedRoleService', () => {
  // Original window implementation
  const originalWindow = global.window;

  beforeAll(() => {
    // Mock window for browser environment
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: localStorageMock
      },
      writable: true
    });
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });
  
  afterAll(() => {
    // Restore window
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true
    });
    
    // Reset localStorage mock
    localStorageMock.clear();
  });
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });
  
  describe('Construction and Initialization', () => {
    it('should create an instance with default config', () => {
      const service = new UnifiedRoleService();
      expect(service).toBeDefined();
    });
    
    it('should merge custom config with defaults', () => {
      const service = new UnifiedRoleService({
        debug: true,
        defaultRole: 'advertiser' as UserRoleType
      });
      
      // Test by checking default role data
      const roleData = (service as any).createDefaultRoleData();
      expect(roleData.currentRole).toBe('advertiser');
    });
    
    it('should load from localStorage on initialization if data exists', () => {
      // Setup mock data in localStorage
      const mockData: RoleData = {
        currentRole: 'publisher' as UserRoleType,
        availableRoles: ['user', 'publisher'] as UserRoleType[],
        timestamp: Date.now()
      };
      
      localStorage.setItem('nostr_ads_role_data', JSON.stringify(mockData));
      
      // Create service which should load the data
      const service = new UnifiedRoleService();
      
      // Verify data was loaded
      expect(service.getCurrentRoleFromLocalContext()).toBe('publisher');
    });
  });
  
  describe('Local Role Management', () => {
    it('should return default role data when no cache exists', () => {
      const service = new UnifiedRoleService();
      
      // Clear any cached data
      (service as any).cache = null;
      
      const data = service.getRoleData();
      expect(data.currentRole).toBe('user');
      expect(data.availableRoles).toEqual(['user']);
    });
    
    it('should store and retrieve role data correctly', () => {
      const service = new UnifiedRoleService();
      
      const testData: RoleData = {
        currentRole: 'advertiser' as UserRoleType,
        availableRoles: ['user', 'advertiser'] as UserRoleType[],
        timestamp: Date.now()
      };
      
      service.setRoleData(testData);
      
      const retrievedData = service.getRoleData();
      expect(retrievedData.currentRole).toBe('advertiser');
      expect(retrievedData.availableRoles).toEqual(['user', 'advertiser']);
    });
    
    it('should update current role for the local context', () => {
      const service = new UnifiedRoleService();
      
      // Set up available roles
      service.setRoleData({
        currentRole: 'user' as UserRoleType,
        availableRoles: ['user', 'advertiser', 'publisher'] as UserRoleType[],
        timestamp: Date.now()
      });
      
      // Change current role
      const result = service.setCurrentRoleInLocalContext('advertiser' as UserRoleType);
      
      expect(result).toBe(true);
      expect(service.getCurrentRoleFromLocalContext()).toBe('advertiser');
    });
    
    it('should not update to an unavailable role', () => {
      const service = new UnifiedRoleService();
      
      // Set up available roles that don't include 'admin'
      service.setRoleData({
        currentRole: 'user' as UserRoleType,
        availableRoles: ['user', 'advertiser'] as UserRoleType[],
        timestamp: Date.now()
      });
      
      // Try to change to an unavailable role
      const result = service.setCurrentRoleInLocalContext('admin' as UserRoleType);
      
      expect(result).toBe(false);
      expect(service.getCurrentRoleFromLocalContext()).toBe('user'); // Should remain unchanged
    });
    
    it('should properly check if a role is available', () => {
      const service = new UnifiedRoleService();
      
      service.setRoleData({
        currentRole: 'user' as UserRoleType,
        availableRoles: ['user', 'advertiser'] as UserRoleType[],
        timestamp: Date.now()
      });
      
      expect(service.isRoleAvailable('user')).toBe(true);
      expect(service.isRoleAvailable('advertiser')).toBe(true);
      expect(service.isRoleAvailable('admin')).toBe(false);
    });
    
    it('should check if user has one of multiple roles', () => {
      const service = new UnifiedRoleService();
      
      service.setRoleData({
        currentRole: 'publisher' as UserRoleType,
        availableRoles: ['user', 'publisher'] as UserRoleType[],
        timestamp: Date.now()
      });
      
      expect(service.hasAnyRole(['admin', 'publisher'])).toBe(true);
      expect(service.hasAnyRole(['admin', 'advertiser'])).toBe(false);
    });
  });
  
  describe('Server Role Management', () => {
    it('should handle test mode users specially', async () => {
      // Mock the prisma findFirst to return a test user
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'pk_test_user123',
        nostrPubkey: 'pk_test_user123',
        isAdvertiser: false,
        isPublisher: false,
        isAdmin: false,
        isStakeholder: false,
        preferences: {
          currentRole: 'user'
        }
      });
      
      const roles = await unifiedRoleService.getUserRoles('pk_test_user123');
      
      // Test users should get all roles
      expect(roles).toEqual(['user', 'advertiser', 'publisher', 'admin', 'stakeholder']);
    });
    
    it('should return available roles based on user flags', async () => {
      // Mock the prisma findFirst to return a user with specific roles
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        nostrPubkey: 'npub123',
        isAdvertiser: true,
        isPublisher: true,
        isAdmin: false,
        isStakeholder: false
      });
      
      const roles = await unifiedRoleService.getUserRoles('user123');
      
      expect(roles).toContain('user');
      expect(roles).toContain('advertiser');
      expect(roles).toContain('publisher');
      expect(roles).not.toContain('admin');
      expect(roles).not.toContain('stakeholder');
    });
    
    it('should return only default role for unknown users', async () => {
      // Mock the prisma findFirst to return null (user not found)
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      
      const roles = await unifiedRoleService.getUserRoles('unknown_user');
      
      expect(roles).toEqual(['user']);
    });
    
    it('should update user roles in the database', async () => {
      // Mock the prisma findFirst and update
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        nostrPubkey: 'npub123',
        isAdvertiser: false,
        isPublisher: false,
        isAdmin: false,
        isStakeholder: false
      });
      
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user123',
        nostrPubkey: 'npub123',
        isAdvertiser: true,
        isPublisher: true,
        isAdmin: false,
        isStakeholder: false
      });
      
      const result = await unifiedRoleService.updateUserRoles(
        'user123',
        ['advertiser', 'publisher'],
        []
      );
      
      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: expect.objectContaining({
          isAdvertiser: true,
          isPublisher: true
        })
      });
    });
  });
  
  describe('Role Synchronization', () => {
    it('should sync role data with the server', async () => {
      // Set up local data
      unifiedRoleService.setRoleData({
        currentRole: 'publisher' as UserRoleType,
        availableRoles: ['user', 'publisher'] as UserRoleType[],
        timestamp: Date.now() - 3600000 // 1 hour old
      });
      
      // Mock fetch to return different data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          currentRole: 'advertiser',
          availableRoles: ['user', 'advertiser', 'publisher']
        }),
        status: 200,
        statusText: 'OK'
      } as Response);
      
      const result = await unifiedRoleService.syncWithServer();
      
      expect(result.currentRole).toBe('advertiser');
      expect(result.availableRoles).toContain('advertiser');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/enhanced-roles/data'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      );
    });
    
    it('should handle server errors gracefully', async () => {
      // Set up local data
      const initialData = {
        currentRole: 'user' as UserRoleType,
        availableRoles: ['user'] as UserRoleType[],
        timestamp: Date.now()
      };
      
      unifiedRoleService.setRoleData(initialData);
      
      // Mock fetch to return an error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);
      
      const result = await unifiedRoleService.syncWithServer();
      
      // Should return the local data if server sync fails
      expect(result.currentRole).toBe('user');
      expect(result.availableRoles).toEqual(['user']);
    });
  });
});