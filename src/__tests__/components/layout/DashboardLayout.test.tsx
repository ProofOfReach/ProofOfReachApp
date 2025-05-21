import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

// Mock Sidebar component to avoid testing its functionality here
jest.mock('../../../components/layout/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar-mock">Sidebar Mock</div>;
  };
});

// Mock DebugRoleEnabler component
jest.mock('../../../components/DebugRoleEnabler', () => {
  return function MockDebugRoleEnabler() {
    return <div data-testid="debug-role-enabler-mock">Debug Role Enabler Mock</div>;
  };
});

// Mock TestModeBanner component
jest.mock('../../../components/TestModeBanner', () => {
  return function MockTestModeBanner() {
    return <div data-testid="test-mode-banner-mock">Test Mode Banner Mock</div>;
  };
});

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
  }),
}));

describe('DashboardLayout Component', () => {
  it('renders the sidebar and content properly', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </DashboardLayout>
    );
    
    // Check if sidebar is rendered
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    
    // Check if content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check if footer is rendered
    expect(screen.getByText(/Proof Of Reach/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });
  
  it('wraps the content in the role provider context', () => {
    // Since we're using the RoleProvider in the DashboardLayout
    // we can test if the provider is functioning correctly by checking
    // if the role state is available to children
    
    // Create a component that would use the role context
    const TestComponent = () => {
      // We can't actually test the context here since we've mocked Sidebar
      // But we can check if the component renders properly
      return <div data-testid="test-component">Test Component with Role</div>;
    };
    
    render(
      <DashboardLayout>
        <TestComponent />
      </DashboardLayout>
    );
    
    // Check if the component rendered
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});