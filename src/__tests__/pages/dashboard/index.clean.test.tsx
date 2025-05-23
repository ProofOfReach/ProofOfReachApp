import { screen } from '@testing-library/react';
import DashboardPage from '../../../pages/dashboard/index';
import React from 'react';

// Custom render function to avoid test-utils dependencies
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
jest.mock('../../../context/RoleContext', () => {
  const React = require('react');
  return {
    defaultUseRole: () => ({
      role: 'viewer',
      setRole: jest.fn(),
      availableRoles: ['viewer', 'advertiser', 'publisher'],
      isRoleAvailable: () => true,
    }),
    RoleProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
  };
});

// Mock CurrencyAmount component
jest.mock('../../../components/CurrencyAmount', () => ({
  __esModule: true,
  default: ({ sats }: { sats: number }) => <span data-testid="currency-amount">{sats} sats</span>,
}));

// Mock TestModeBanner component
jest.mock('../../../components/TestModeBanner', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function MockTestModeBanner() {
      return React.createElement('div', { 'data-testid': 'test-mode-banner-mock' }, 'Test Mode Banner Mock');
    }
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

describe('Dashboard Page', () => {
  it('renders the user dashboard', () => {
    render(<DashboardPage />);
    
    // Page should show viewer dashboard content
    expect(screen.getByText('Viewer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Proof of Reach')).toBeInTheDocument();
    expect(screen.getByText('As a Viewer, you can browse ads, interact with content, and earn rewards through the Lightning Network.')).toBeInTheDocument();
    
    // The dashboard shows some system status information
    expect(screen.getByText('Test Mode:')).toBeInTheDocument();
    expect(screen.getByText('API Status:')).toBeInTheDocument();
  });
});