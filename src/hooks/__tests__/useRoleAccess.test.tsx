import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import defaultUseRoleAccess from '../defaultUseRoleAccess';
import '@/services/roleManager';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock RoleManager service
jest.mock('@/services/roleManager', () => ({
  RoleManager: {
    getCurrentRole: jest.fn(),
    getAvailableRoles: jest.fn(),
    setCurrentRole: jest.fn(),
  },
}));

describe('defaultUseRoleAccess', () => {
  // Setup mock router
  const mockRouter = {
    pathname: '/dashboard',
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default router setup
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Default RoleManager setup
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('viewer');
    (RoleManager.getAvailableRoles as jest.Mock).mockReturnValue(['viewer', 'advertiser', 'publisher']);
    (RoleManager.setCurrentRole as jest.Mock).mockResolvedValue(true);
    
    // Mock document events
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });

  it('initializes with the current role from RoleManager', () => {
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('publisher');
    
    const { result } = renderHook(() => defaultUseRoleAccess());
    
    expect(result.current.currentRole).toBe('publisher');
    expect(RoleManager.getCurrentRole).toHaveBeenCalled();
  });

  it('provides a list of available roles', () => {
    const mockRoles = ['viewer', 'advertiser', 'publisher', 'admin'];
    (RoleManager.getAvailableRoles as jest.Mock).mockReturnValue(mockRoles);
    
    const { result } = renderHook(() => defaultUseRoleAccess());
    
    expect(result.current.availableRoles).toEqual(mockRoles);
    expect(RoleManager.getAvailableRoles).toHaveBeenCalled();
  });

  it('checks capability based on current role', () => {
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('advertiser');
    
    const { result } = renderHook(() => defaultUseRoleAccess());
    
    // Advertiser capabilities
    expect(result.current.hasCapability('viewContent')).toBe(true);
    expect(result.current.hasCapability('createCampaign')).toBe(true);
    
    // Admin-only capabilities
    expect(result.current.hasCapability('manageUsers')).toBe(false);
    expect(result.current.hasCapability('editAnyCampaign')).toBe(false);
  });

  it('validates role access levels correctly', () => {
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('admin');
    
    const { result } = renderHook(() => defaultUseRoleAccess());
    
    // Admin can access all roles
    expect(result.current.checkRole('viewer').isAllowed).toBe(true);
    expect(result.current.checkRole('advertiser').isAllowed).toBe(true);
    expect(result.current.checkRole('publisher').isAllowed).toBe(true);
    expect(result.current.checkRole('admin').isAllowed).toBe(true);
    
    // Even admin can't access developer role
    expect(result.current.checkRole('developer').isAllowed).toBe(false);
  });

  it('checks route access based on role permissions', () => {
    // First test with viewer role
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('viewer');
    mockRouter.pathname = '/dashboard/admin';
    
    const { result, rerender } = renderHook(() => defaultUseRoleAccess());
    
    // Viewer can't access admin routes
    expect(result.current.checkRouteAccess().isAllowed).toBe(false);
    
    // Now test with admin role
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('admin');
    rerender();
    
    // Admin can access admin routes
    expect(result.current.checkRouteAccess().isAllowed).toBe(true);
  });

  it('enforces route access with redirects', () => {
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('viewer');
    mockRouter.pathname = '/dashboard/admin/settings';
    
    const { result } = renderHook(() => defaultUseRoleAccess());
    
    // Should redirect and return false
    expect(result.current.enforceRouteAccess()).toBe(false);
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    
    // Reset and try with admin
    jest.clearAllMocks();
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('admin');
    const { result: adminResult } = renderHook(() => defaultUseRoleAccess());
    
    // Should not redirect and return true
    expect(adminResult.current.enforceRouteAccess()).toBe(true);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('updates role when setRole is called', async () => {
    const { result } = renderHook(() => defaultUseRoleAccess());
    
    await act(async () => {
      const log = await result.current.setRole('publisher');
      expect(log).toBe(true);
    });
    
    expect(RoleManager.setCurrentRole).toHaveBeenCalledWith('publisher');
    expect(result.current.currentRole).toBe('publisher');
  });

  it('handles role change events', () => {
    // Capture the event listener
    let roleChangeHandler: EventListener;
    (document.addEventListener as jest.Mock).mockImplementation((event, handler) => {
      if (event === 'roleSwitched') {
        roleChangeHandler = handler;
      }
    });
    
    const { result } = renderHook(() => defaultUseRoleAccess());
    expect(document.addEventListener).toHaveBeenCalledWith('roleSwitched', expect.any(Function));
    
    // Initial role is viewer
    expect(result.current.currentRole).toBe('viewer');
    
    // Simulate role change event
    act(() => {
      const customEvent = new CustomEvent('roleSwitched', { 
        detail: { from: 'viewer', to: 'admin' } 
      });
      roleChangeHandler(customEvent);
    });
    
    // Role should be updated
    expect(result.current.currentRole).toBe('admin');
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => defaultUseRoleAccess());
    
    unmount();
    
    expect(document.removeEventListener).toHaveBeenCalledWith('roleSwitched', expect.any(Function));
  });
});