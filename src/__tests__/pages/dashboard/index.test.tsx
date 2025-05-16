import { screen } from '@testing-library/react';
import DashboardPage from '../../../pages/dashboard/index';
import React from 'react';

// Custom render function that doesn't use the shared test-utils
const render = (ui: React.ReactElement) => {
  return require('@testing-library/react').render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>
  });
};

// Mock router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
  }),
}));

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({
    data: { balance: 0 },
    isLoading: false,
    error: null,
  }),
}));

// Mock RoleContext
jest.mock('../../../context/RoleContext', () => ({
  useRole: () => ({
    role: 'user',
    setRole: jest.fn(),
    availableRoles: ['user', 'advertiser', 'publisher'],
    isRoleAvailable: () => true,
  }),
}));

// Mock CurrencyAmount component
jest.mock('../../../components/CurrencyAmount', () => ({
  __esModule: true,
  default: ({ sats }: { sats: number }) => <span data-testid="currency-amount">{sats} sats</span>,
}));

// Mock TestModeBanner component
jest.mock('../../../components/TestModeBanner', () => {
  return function MockTestModeBanner() {
    return <div data-testid="test-mode-banner-mock">Test Mode Banner Mock</div>;
  };
});

// Mock TestModeContext
jest.mock('../../../context/TestModeContext', () => {
  const React = require('react');
  return {
    useTestMode: jest.fn().mockReturnValue({
      isTestMode: true,
      enableTestMode: jest.fn(),
      disableTestMode: jest.fn(),
      timeRemaining: 3600,
      enableAllRoles: jest.fn().mockResolvedValue(true),
      setCurrentRole: jest.fn().mockResolvedValue(true),
      isTestModeAvailable: true,
      isDevEnvironment: true,
      isDevelopment: true
    }),
    TestModeProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
  };
});

// Mock RoleService
jest.mock('../../../lib/roleService', () => ({
  RoleService: {
    getCurrentRole: jest.fn().mockReturnValue('user'),
    changeRole: jest.fn(),
  }
}));

// If needed, add additional mocks for other dependencies
jest.mock('../../../components/ui', () => ({
  DashboardContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-container">{children}</div>
  ),
  DashboardCard: ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div data-testid="dashboard-card">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe('Dashboard Page', () => {
  it('renders the dashboard with user role', () => {
    render(<DashboardPage />);
    
    // Verify the dashboard title is rendered
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    
    // Verify system status section
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('Current Role:')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });
});