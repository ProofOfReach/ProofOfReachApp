import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@/components/errors/PermissionErrorDisplay';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return (
      <a href={href} data-testid="mock-link">
        {children}
      </a>
    );
  };
});

describe('PermissionErrorDisplay', () => {
  it('renders default message when no specific context is provided', () => {
    render(<PermissionErrorDisplay />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You don\'t have permission to perform this action.')).toBeInTheDocument();
  });
  
  it('displays custom message when provided', () => {
    const customMessage = 'You need to upgrade your account to access this feature.';
    render(<PermissionErrorDisplay message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
  
  it('shows role-specific message when requiredRole is provided', () => {
    render(<PermissionErrorDisplay requiredRole="admin" />);
    
    expect(screen.getByText('You need admin role to access this resource.')).toBeInTheDocument();
  });
  
  it('shows permission-specific message when requiredPermission is provided', () => {
    render(<PermissionErrorDisplay requiredPermission="MANAGE_USERS" />);
    
    expect(screen.getByText('You don\'t have the required permission (MANAGE_USERS) to perform this action.')).toBeInTheDocument();
  });
  
  it('displays additional information based on error code', () => {
    // UNAUTHENTICATED
    const { rerender } = render(<PermissionErrorDisplay code="UNAUTHENTICATED" />);
    expect(screen.getByText('You need to log in to continue.')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    
    // INSUFFICIENT_ROLE
    rerender(<PermissionErrorDisplay code="INSUFFICIENT_ROLE" />);
    expect(screen.getByText('Your current role doesn\'t have sufficient privileges.')).toBeInTheDocument();
    
    // EXPIRED_SESSION
    rerender(<PermissionErrorDisplay code="EXPIRED_SESSION" />);
    expect(screen.getByText('Your session has expired. Please log in again.')).toBeInTheDocument();
    
    // ACCOUNT_LOCKED
    rerender(<PermissionErrorDisplay code="ACCOUNT_LOCKED" />);
    expect(screen.getByText('Your account has been temporarily locked.')).toBeInTheDocument();
  });
  
  it('shows login link for authentication-related error codes', () => {
    render(<PermissionErrorDisplay code="UNAUTHENTICATED" />);
    
    const loginLink = screen.getByText('Log In');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
  
  it('uses custom login URL when provided', () => {
    render(<PermissionErrorDisplay code="UNAUTHENTICATED" loginUrl="/auth/signin" />);
    
    const loginLink = screen.getByText('Log In');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/auth/signin');
  });
  
  it('hides login link when showLoginLink is false', () => {
    render(<PermissionErrorDisplay code="UNAUTHENTICATED" showLoginLink={false} />);
    
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
  });
  
  it('renders custom action with href when provided', () => {
    const customAction = {
      label: 'Request Access',
      href: '/request-access'
    };
    
    render(<PermissionErrorDisplay customAction={customAction} />);
    
    const actionLink = screen.getByText('Request Access');
    expect(actionLink).toBeInTheDocument();
    expect(actionLink.closest('a')).toHaveAttribute('href', '/request-access');
  });
  
  it('renders custom action with onClick when provided', () => {
    const handleClick = jest.fn();
    const customAction = {
      label: 'Request Access',
      onClick: handleClick
    };
    
    render(<PermissionErrorDisplay customAction={customAction} />);
    
    const actionButton = screen.getByText('Request Access');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies custom className when provided', () => {
    const { container } = render(<PermissionErrorDisplay className="custom-class" />);
    
    const errorElement = container.firstChild;
    expect(errorElement).toHaveClass('custom-class');
  });
});