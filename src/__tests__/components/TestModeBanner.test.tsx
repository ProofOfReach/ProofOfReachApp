import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestModeBanner from '../../components/TestModeBanner';
import { useTestMode } from '../../hooks/useTestMode';
import { RoleService } from '../../lib/roleService';
import { RoleManager } from '../../services/roleManager';

// Mock the useTestMode hook
jest.mock('../../hooks/useTestMode', () => ({
  useTestMode: jest.fn()
}));

// Mock the RoleService
jest.mock('../../lib/roleService', () => ({
  RoleService: {
    getCurrentRole: jest.fn(),
    enableAllRoles: jest.fn(),
    changeRole: jest.fn()
  }
}));

// Mock the RoleManager
jest.mock('../../services/roleManager', () => {
  // Create a properly typed mock function for isValidRole
  const mockIsValidRole = jest.fn().mockImplementation(() => true);
  
  return {
    RoleManager: {
      getCurrentRole: jest.fn(),
      setCurrentRole: jest.fn().mockReturnValue(false), // Return false to force fallback
      isValidRole: mockIsValidRole // Use the properly typed mock
    }
  };
});

describe('TestModeBanner', () => {
  // Setup default mocks before each test
  beforeEach(() => {
    // Default mock implementation for useTestMode
    // Note: Using admin role to match current implementation where the banner is only visible to admins
    (useTestMode as jest.Mock).mockReturnValue({
      isActive: true,
      timeRemaining: 240,
      disableTestMode: jest.fn(),
      enableAllRoles: jest.fn().mockResolvedValue(true),
      setCurrentRole: jest.fn().mockResolvedValue(true),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
    
    // Default mock implementation for RoleService
    (RoleService.getCurrentRole as jest.Mock).mockReturnValue('viewer');
    (RoleService.enableAllRoles as jest.Mock).mockResolvedValue(true);
    (RoleService.changeRole as jest.Mock).mockImplementation(() => {
      // Simulate a role change by dispatching the roleSwitched event
      document.dispatchEvent(new Event('roleSwitched'));
      return true;
    });
    
    // Default mock implementation for RoleManager
    (RoleManager.getCurrentRole as jest.Mock).mockReturnValue('viewer');
    (RoleManager.setCurrentRole as jest.Mock).mockReturnValue(false); // Force fallback to context methods
    // Create a proper mock for isValidRole with correct typing
    (RoleManager.isValidRole as unknown as jest.Mock).mockReturnValue(true); // Always consider roles valid in tests
    
    // Mock localStorage and sessionStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockImplementation(key => {
          if (key === 'currentRole') return 'viewer';
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });
  
  it('renders the banner when in test mode', () => {
    render(<TestModeBanner />);
    
    expect(screen.getByText('TEST MODE ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Exit Test Mode')).toBeInTheDocument();
  });
  
  it('does not render when not in test mode', () => {
    (useTestMode as jest.Mock).mockReturnValue({
      isActive: false,
      timeRemaining: null,
      disableTestMode: jest.fn(),
      enableAllRoles: jest.fn(),
      setCurrentRole: jest.fn(),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
    
    const { container } = render(<TestModeBanner />);
    expect(container).toBeEmptyDOMElement();
  });
  
  it('shows time remaining', () => {
    render(<TestModeBanner />);
    
    // Should display 4h 0m from the 240 minutes in the mock
    expect(screen.getByText(/\(Expires in 4h 0m\)/)).toBeInTheDocument();
  });
  
  it('calls disableTestMode when exit button is clicked', () => {
    const mockDisableTestMode = jest.fn();
    (useTestMode as jest.Mock).mockReturnValue({
      isActive: true,
      timeRemaining: 240,
      disableTestMode: mockDisableTestMode,
      enableAllRoles: jest.fn().mockResolvedValue(true),
      setCurrentRole: jest.fn().mockResolvedValue(true),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
    
    render(<TestModeBanner />);
    
    const exitButton = screen.getByText('Exit Test Mode');
    fireEvent.click(exitButton);
    
    expect(mockDisableTestMode).toHaveBeenCalledTimes(1);
  });
  
  it('toggles debug panel when clicked', () => {
    render(<TestModeBanner />);
    
    // Debug panel should start collapsed
    expect(screen.queryByTestId('enable-all-roles-button')).not.toBeInTheDocument();
    
    // Click the debug toggle button
    const debugToggle = screen.getByTestId('toggle-debug-panel');
    fireEvent.click(debugToggle);
    
    // Debug panel should now be visible
    expect(screen.getByTestId('enable-all-roles-button')).toBeInTheDocument();
  });
  
  it('calls enableAllRoles when Enable All Roles button is clicked', async () => {
    const mockEnableAllRoles = jest.fn().mockResolvedValue(true);
    (useTestMode as jest.Mock).mockReturnValue({
      isActive: true,
      timeRemaining: 240,
      disableTestMode: jest.fn(),
      enableAllRoles: mockEnableAllRoles,
      setCurrentRole: jest.fn().mockResolvedValue(true),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
    
    render(<TestModeBanner />);
    
    // Expand the debug panel
    const debugToggle = screen.getByTestId('toggle-debug-panel');
    fireEvent.click(debugToggle);
    
    // Click the Enable All Roles button
    const enableRolesButton = screen.getByTestId('enable-all-roles-button');
    fireEvent.click(enableRolesButton);
    
    // Check if the context method was called
    await waitFor(() => {
      expect(mockEnableAllRoles).toHaveBeenCalledTimes(1);
    });
  });
  
  it('shows current role and allows switching roles', async () => {
    const mockSetCurrentRole = jest.fn().mockResolvedValue(true);
    (useTestMode as jest.Mock).mockReturnValue({
      isActive: true,
      timeRemaining: 240,
      disableTestMode: jest.fn(),
      enableAllRoles: jest.fn().mockResolvedValue(true),
      setCurrentRole: mockSetCurrentRole,
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
    
    // Start with 'viewer' role
    (RoleService.getCurrentRole as jest.Mock).mockReturnValue('viewer');
    
    const { rerender } = render(<TestModeBanner />);
    
    // Expand the debug panel
    const debugToggle = screen.getByTestId('toggle-debug-panel');
    fireEvent.click(debugToggle);
    
    // Current role should be displayed
    expect(screen.getByTestId('current-role')).toHaveTextContent('viewer');
    
    // Click the Advertiser role button
    const advertiserButton = screen.getByTestId('role-button-advertiser');
    fireEvent.click(advertiserButton);
    
    // Check if context method was called
    await waitFor(() => {
      expect(mockSetCurrentRole).toHaveBeenCalledWith('advertiser');
    });
    
    // Simulate role change in localStorage
    (window.localStorage.getItem as jest.Mock).mockImplementation(key => {
      if (key === 'currentRole') return 'advertiser';
      return null;
    });
    
    // Simulate role change event
    window.dispatchEvent(new CustomEvent('role-changed', { 
      detail: { role: 'advertiser' } 
    }));
    
    // Re-render component
    rerender(<TestModeBanner />);
    
    // Should show updated role
    expect(screen.getByTestId('current-role')).toHaveTextContent('advertiser');
  });
  
  it('falls back to legacy methods when context methods fail', async () => {
    // Mock context methods to fail
    const mockEnableAllRoles = jest.fn().mockResolvedValue(false);
    const mockSetCurrentRole = jest.fn().mockResolvedValue(false);
    
    (useTestMode as jest.Mock).mockReturnValue({
      isActive: true,
      timeRemaining: 240,
      disableTestMode: jest.fn(),
      enableAllRoles: mockEnableAllRoles,
      setCurrentRole: mockSetCurrentRole,
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'viewer',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
    
    render(<TestModeBanner />);
    
    // Expand the debug panel
    const debugToggle = screen.getByTestId('toggle-debug-panel');
    fireEvent.click(debugToggle);
    
    // Click the Enable All Roles button
    const enableRolesButton = screen.getByTestId('enable-all-roles-button');
    fireEvent.click(enableRolesButton);
    
    // Check that context method was called first
    await waitFor(() => {
      expect(mockEnableAllRoles).toHaveBeenCalledTimes(1);
    });
    
    // Check that legacy method was called as fallback
    await waitFor(() => {
      expect(RoleService.enableAllRoles).toHaveBeenCalledTimes(1);
    });
    
    // Click a role button
    const adminButton = screen.getByTestId('role-button-admin');
    fireEvent.click(adminButton);
    
    // Check that context method was called first
    await waitFor(() => {
      expect(mockSetCurrentRole).toHaveBeenCalledWith('admin');
    });
    
    // Check that legacy method was called as fallback
    await waitFor(() => {
      expect(RoleService.changeRole).toHaveBeenCalledWith('admin');
    });
  });
});