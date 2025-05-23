import React from 'react';
import { render, screen } from '@testing-library/react';
import RoleGuard from '../RoleGuard';
import "./hooks/useRoleAccess';

// Mock the useRoleAccess hook
jest.mock('@/hooks/useRoleAccess');

describe('RoleGuard Component', () => {
  // Test setup
  const mockUseRoleAccess = useRoleAccess as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn().mockReturnValue({ isAllowed: true }),
      hasCapability: jest.fn().mockReturnValue(true),
      currentRole: 'viewer'
    });
  });
  
  it('renders children when user has the required role', () => {
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn().mockReturnValue({ isAllowed: true }),
      hasCapability: jest.fn(),
      currentRole: 'admin'
    });
    
    render(
      <RoleGuard requiredRole="admin">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
  
  it('does not render children when user lacks the required role', () => {
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn().mockReturnValue({ isAllowed: false }),
      hasCapability: jest.fn(),
      currentRole: 'viewer'
    });
    
    render(
      <RoleGuard requiredRole="admin">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
  
  it('renders fallback when user lacks the required role', () => {
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn().mockReturnValue({ isAllowed: false }),
      hasCapability: jest.fn(),
      currentRole: 'viewer'
    });
    
    render(
      <RoleGuard 
        requiredRole="admin"
        fallback={<div data-testid="fallback-content">Access Denied</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
  });
  
  it('renders children when user has the required capability', () => {
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn(),
      hasCapability: jest.fn().mockReturnValue(true),
      currentRole: 'admin'
    });
    
    render(
      <RoleGuard requiredCapability="manageUsers">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
  
  it('does not render children when user lacks the required capability', () => {
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn(),
      hasCapability: jest.fn().mockReturnValue(false),
      currentRole: 'viewer'
    });
    
    render(
      <RoleGuard requiredCapability="manageUsers">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
  
  it('requires at least one of requiredRole or requiredCapability', () => {
    // Mock console.warn
    const originalWarn = console.warn;
    console.warn = jest.fn();
    
    render(
      <RoleGuard>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>
    );
    
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Either requiredRole or requiredCapability must be provided'));
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Restore console.warn
    console.warn = originalWarn;
  });
  
  it('checks both role and capability when both are provided (requiring both)', () => {
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn().mockReturnValue({ isAllowed: true }),
      hasCapability: jest.fn().mockReturnValue(true), // Both return true
      currentRole: 'admin'
    });
    
    render(
      <RoleGuard requiredRole="admin" requiredCapability="manageUsers">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    
    // Now fail on capability
    mockUseRoleAccess.mockReturnValue({
      checkRole: jest.fn().mockReturnValue({ isAllowed: true }),
      hasCapability: jest.fn().mockReturnValue(false), // Capability check fails
      currentRole: 'admin'
    });
    
    render(
      <RoleGuard requiredRole="admin" requiredCapability="manageUsers">
        <div data-testid="protected-content-2">Protected Content</div>
      </RoleGuard>
    );
    
    expect(screen.queryByTestId('protected-content-2')).not.toBeInTheDocument();
  });
});