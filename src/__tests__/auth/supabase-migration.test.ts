/**
 * Supabase Migration Test Suite - Phase 1
 * 
 * This test suite ensures safe migration from current auth to Supabase auth
 * by thoroughly testing the existing authentication system before any changes.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { createMockResponse, createMockUser } from '../test-utils';
import { UserRole } from '../../context/RoleContext';

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock UserManager
jest.mock('../../lib/UserManager', () => ({
  getUserRoles: jest.fn(),
  isTestMode: jest.fn(),
  getUserProfile: jest.fn(),
  enableAllRolesForTestUser: jest.fn(),
}));

const mockUserManager = require('../../lib/UserManager');

describe('Phase 1: Current Authentication System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockFetch.mockClear();
    
    // Reset UserManager mocks
    mockUserManager.getUserRoles.mockResolvedValue(['viewer']);
    mockUserManager.isTestMode.mockResolvedValue(false);
    mockUserManager.getUserProfile.mockResolvedValue(null);
    mockUserManager.enableAllRolesForTestUser.mockResolvedValue(true);
  });

  describe('Authentication State Management', () => {
    it('should initialize with null auth state', () => {
      const { result } = renderHook(() => useAuthProvider());
      
      expect(result.current.auth).toBe(null);
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });

    it('should handle successful login flow', async () => {
      const testPubkey = 'test-pubkey-123';
      
      // Mock successful login API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Mock user data
      mockUserManager.getUserRoles.mockResolvedValueOnce(['viewer', 'advertiser']);
      mockUserManager.getUserProfile.mockResolvedValueOnce({
        name: 'Test User',
        displayName: 'Test User',
        avatar: null
      });
      
      const { result } = renderHook(() => useAuthProvider());
      
      await act(async () => {
        const success = await result.current.login(testPubkey as UserRole, false);
        expect(success).toBe(true);
      });
      
      await waitFor(() => {
        expect(result.current.auth).not.toBe(null);
        expect(result.current.auth?.isLoggedIn).toBe(true);
        expect(result.current.auth?.pubkey).toBe(testPubkey);
        expect(result.current.auth?.availableRoles).toContain('viewer');
        expect(result.current.auth?.availableRoles).toContain('advertiser');
      });
    });

    it('should handle test mode login correctly', async () => {
      const testPubkey = 'test-pubkey-456';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      const { result } = renderHook(() => useAuthProvider());
      
      await act(async () => {
        const success = await result.current.login(testPubkey as UserRole, true);
        expect(success).toBe(true);
      });
      
      await waitFor(() => {
        expect(result.current.auth?.isTestMode).toBe(true);
        expect(result.current.auth?.availableRoles).toEqual([
          'viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'
        ]);
        expect(localStorage.getItem('isTestMode')).toBe('true');
      });
    });
  });

  describe('Authentication Persistence', () => {
    it('should restore authentication state on checkAuth', async () => {
      const testPubkey = 'persisted-user-123';
      
      // Mock successful auth check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          authenticated: true,
          pubkey: testPubkey
        })
      });
      
      mockUserManager.getUserRoles.mockResolvedValueOnce(['viewer', 'publisher']);
      mockUserManager.isTestMode.mockResolvedValueOnce(false);
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.checkAuth();
      });
      
      await waitFor(() => {
        expect(result.current.auth.isLoggedIn).toBe(true);
        expect(result.current.auth.pubkey).toBe(testPubkey);
        expect(result.current.auth.availableRoles).toContain('publisher');
      });
    });

    it('should handle test mode persistence correctly', async () => {
      const testPubkey = 'test-mode-user-789';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          authenticated: true,
          pubkey: testPubkey
        })
      });
      
      mockUserManager.isTestMode.mockResolvedValueOnce(true);
      mockUserManager.getUserRoles.mockResolvedValueOnce(['viewer']);
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.checkAuth();
      });
      
      await waitFor(() => {
        expect(result.current.auth.isTestMode).toBe(true);
        expect(result.current.auth.availableRoles).toEqual([
          'viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'
        ]);
        expect(localStorage.getItem('isTestMode')).toBe('true');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle login API failures gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        const success = await result.current.login('invalid-pubkey' as UserRole, false);
        expect(success).toBe(false);
      });
      
      expect(result.current.auth.isLoggedIn).toBe(false);
    });

    it('should handle checkAuth API failures gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.checkAuth();
      });
      
      expect(result.current.auth.isLoggedIn).toBe(false);
      expect(result.current.auth.pubkey).toBe('');
    });

    it('should handle UserManager service failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Simulate UserManager failure
      mockUserManager.getUserRoles.mockRejectedValueOnce(new Error('Service unavailable'));
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        const success = await result.current.login('test-pubkey' as UserRole, false);
        // Login should still succeed even if UserManager fails
        expect(success).toBe(true);
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should clear authentication state on logout', async () => {
      // First login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.login('test-user' as UserRole, true);
      });
      
      // Then logout
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      await act(async () => {
        await result.current.logout();
      });
      
      expect(result.current.auth.isLoggedIn).toBe(false);
      expect(result.current.auth.pubkey).toBe('');
      expect(result.current.auth.isTestMode).toBe(false);
      expect(localStorage.getItem('isTestMode')).toBeNull();
    });
  });
});