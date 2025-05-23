/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useAuthProvider, useAuth, AuthContext } from '../../hooks/useAuth';
import UserManager from '../../models/user';
import type { UserRole } from '../../context/RoleContext';
import React from 'react';

// Mock the UserManager model
jest.mock('../../models/user', () => ({
  getUserRoles: jest.fn().mockResolvedValue(['viewer' as UserRole]),
  enableAllRolesForTestUser: jest.fn().mockResolvedValue(true),
  getUserProfile: jest.fn().mockResolvedValue(null),
  isTestMode: jest.fn().mockResolvedValue(false),
  addRoleToUser: jest.fn().mockResolvedValue(true),
  removeRoleFromUser: jest.fn().mockResolvedValue(true),
}));

// Mock fetch calls
global.fetch = jest.fn();

describe('useAuth Hook', () => {
  let mockFetch: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    
    // Type assertion to resolve TypeScript error
    mockFetch = global.fetch as jest.Mock;
    
    // Default fetch implementation
    mockFetch.mockImplementation(async (url) => {
      if (url === '/api/auth/check') {
        return {
          ok: true,
          json: async () => ({ authenticated: false }),
        };
      }
      return {
        ok: true,
        json: async () => ({}),
      };
    });
  });
  
  describe('useAuthProvider', () => {
    it('initializes with null auth state', () => {
      const { result } = renderHook(() => useAuthProvider());
      
      expect(result.current.auth).toBe(null);
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refreshRoles).toBe('function');
      expect(typeof result.current.addRole).toBe('function');
      expect(typeof result.current.removeRole).toBe('function');
    });
    
    it('checks authentication status on mount', async () => {
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ 
            authenticated: true, 
            pubkey: 'test-pubkey-123' 
          }),
        };
      });
      
      (UserManager.isTestMode as jest.Mock).mockResolvedValue(false);
      (UserManager.getUserRoles as jest.Mock).mockResolvedValue(['viewer' as UserRole]);
      (UserManager.getUserProfile as jest.Mock).mockResolvedValue({
        name: 'Test User',
        displayName: 'Test Display',
        avatar: 'test-avatar.png',
      });
      
      const { result, rerender } = renderHook(() => useAuthProvider());
      
      // Wait for the auth check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Re-render to get updated state
      rerender();
      
      expect(result.current.auth).not.toBe(null);
      expect(result.current.auth?.pubkey).toBe('test-pubkey-123');
      expect(result.current.auth?.isLoggedIn).toBe(true);
      expect(result.current.auth?.availableRoles).toEqual(['viewer']);
      expect(result.current.auth?.profile).toEqual({
        name: 'Test User',
        displayName: 'Test Display',
        avatar: 'test-avatar.png',
      });
    });
    
    it('handles logful login', async () => {
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ log: true }),
        };
      });
      
      (UserManager.getUserRoles as jest.Mock).mockResolvedValue(['viewer' as UserRole, 'advertiser' as UserRole]);
      (UserManager.getUserProfile as jest.Mock).mockResolvedValue({
        name: 'Test User',
      });
      
      const { result } = renderHook(() => useAuthProvider());
      
      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.login('test-pubkey-123', false);
      });
      
      expect(loginResult).toBe(true);
      expect(result.current.auth?.pubkey).toBe('test-pubkey-123');
      expect(result.current.auth?.isLoggedIn).toBe(true);
      expect(result.current.auth?.availableRoles).toEqual(['viewer', 'advertiser']);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
    });
    
    it('handles failed login', async () => {
      // Clear any previous mock implementations
      mockFetch.mockReset();
      
      // Set up a non-ok response for the login attempt
      mockFetch.mockImplementation(async (url, options) => {
        if (url === '/api/auth/login') {
          return {
            ok: false,
            status: 401,
            json: async () => ({ error: 'Login failed' })
          };
        }
        
        // For any other request (like auth check)
        return {
          ok: true,
          json: async () => ({ authenticated: false })
        };
      });
      
      const { result } = renderHook(() => useAuthProvider());
      
      // Wait for initial auth check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      
      // Now try to login which should fail
      let log;
      await act(async () => {
        log = await result.current.login('test-pubkey-123', false);
      });
      
      // Verify login failed
      expect(log).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST'
      }));
    });
    
    it('handles test mode login with all roles enabled', async () => {
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ log: true }),
        };
      });
      
      const { result } = renderHook(() => useAuthProvider());
      
      await act(async () => {
        await result.current.login('test-pubkey-123', true);
      });
      
      expect(result.current.auth?.isTestMode).toBe(true);
      // Now includes all roles for test mode
      expect(result.current.auth?.availableRoles).toEqual(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']);
      expect(UserManager.enableAllRolesForTestUser).toHaveBeenCalledWith('test-pubkey-123');
    });
    
    it('handles logout logfully', async () => {
      // First login
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ log: true }),
        };
      });
      
      const { result } = renderHook(() => useAuthProvider());
      
      await act(async () => {
        await result.current.login('test-pubkey-123', false);
      });
      
      expect(result.current.auth?.isLoggedIn).toBe(true);
      
      // Then logout
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ log: true }),
        };
      });
      
      await act(async () => {
        await result.current.logout();
      });
      
      expect(result.current.auth?.isLoggedIn).toBe(false);
      expect(result.current.auth?.pubkey).toBe('');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    });
  });
  
  describe('useAuth context hook', () => {
    it('uses auth context correctly', () => {
      // Create a proper mock with correct types
      const mockAuth = {
        auth: {
          pubkey: 'context-test-pubkey',
          isLoggedIn: true,
          isTestMode: false,
          availableRoles: ['viewer', 'publisher'] as UserRole[],
          profile: null,
        },
        login: jest.fn().mockResolvedValue(true),
        logout: jest.fn().mockResolvedValue(undefined),
        refreshRoles: jest.fn().mockResolvedValue(['viewer'] as UserRole[]),
        addRole: jest.fn().mockResolvedValue(true),
        removeRole: jest.fn().mockResolvedValue(true),
      };
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockAuth}>
          {children}
        </AuthContext.Provider>
      );
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.auth?.pubkey).toBe('context-test-pubkey');
      expect(result.current.auth?.availableRoles).toEqual(['viewer', 'publisher']);
    });
  });
  
  describe('Auth role management', () => {
    it('refreshes roles correctly', async () => {
      // Setup initial auth state
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ 
            authenticated: true, 
            pubkey: 'test-pubkey-123' 
          }),
        };
      });
      
      (UserManager.isTestMode as jest.Mock).mockResolvedValue(false);
      (UserManager.getUserRoles as jest.Mock).mockResolvedValue(["viewer"]);
      
      const { result } = renderHook(() => useAuthProvider());
      
      // Wait for the auth check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Setup for refreshRoles
      (UserManager.getUserRoles as jest.Mock).mockResolvedValueOnce(['viewer' as UserRole, 'advertiser' as UserRole]);
      
      // Call refreshRoles
      let refreshedRoles: string[] = [];
      await act(async () => {
        refreshedRoles = await result.current.refreshRoles();
      });
      
      expect(refreshedRoles).toEqual(['viewer', 'advertiser']);
      expect(result.current.auth?.availableRoles).toEqual(['viewer', 'advertiser']);
    });
    
    it('handles adding a role logfully', async () => {
      // Setup initial auth state
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ 
            authenticated: true, 
            pubkey: 'test-pubkey-123' 
          }),
        };
      });
      
      (UserManager.isTestMode as jest.Mock).mockResolvedValue(false);
      (UserManager.getUserRoles as jest.Mock).mockResolvedValue(["viewer"]);
      
      const { result } = renderHook(() => useAuthProvider());
      
      // Wait for the auth check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Setup for addRole
      (UserManager.addRoleToUser as jest.Mock).mockResolvedValueOnce(true);
      
      // Add a role
      let addResult = false;
      await act(async () => {
        addResult = await result.current.addRole('advertiser');
      });
      
      expect(addResult).toBe(true);
      expect(UserManager.addRoleToUser).toHaveBeenCalledWith('test-pubkey-123', 'advertiser');
      expect(result.current.auth?.availableRoles).toContain('advertiser');
    });
    
    it('handles removing a role logfully', async () => {
      // Setup initial auth state with multiple roles
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ 
            authenticated: true, 
            pubkey: 'test-pubkey-123' 
          }),
        };
      });
      
      (UserManager.isTestMode as jest.Mock).mockResolvedValue(false);
      (UserManager.getUserRoles as jest.Mock).mockResolvedValue(['viewer' as UserRole, 'advertiser' as UserRole, 'publisher' as UserRole]);
      
      const { result } = renderHook(() => useAuthProvider());
      
      // Wait for the auth check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Setup for removeRole
      (UserManager.removeRoleFromUser as jest.Mock).mockResolvedValueOnce(true);
      
      // Remove a role
      let removeResult = false;
      await act(async () => {
        removeResult = await result.current.removeRole('publisher');
      });
      
      expect(removeResult).toBe(true);
      expect(UserManager.removeRoleFromUser).toHaveBeenCalledWith('test-pubkey-123', 'publisher');
      expect(result.current.auth?.availableRoles).not.toContain('publisher');
    });
    
    it('prevents removing the user role', async () => {
      // Setup initial auth state
      mockFetch.mockImplementationOnce(async () => {
        return {
          ok: true,
          json: async () => ({ 
            authenticated: true, 
            pubkey: 'test-pubkey-123' 
          }),
        };
      });
      
      (UserManager.isTestMode as jest.Mock).mockResolvedValue(false);
      (UserManager.getUserRoles as jest.Mock).mockResolvedValue(["viewer"]);
      
      const { result } = renderHook(() => useAuthProvider());
      
      // Wait for the auth check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Try to remove the viewer role
      let removeResult = true;
      await act(async () => {
        removeResult = await result.current.removeRole('viewer');
      });
      
      expect(removeResult).toBe(false);
      expect(UserManager.removeRoleFromUser).not.toHaveBeenCalled();
      expect(result.current.auth?.availableRoles).toContain('viewer');
    });
  });
});