import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardIndex from '../../../pages/dashboard/index';
import '@testing-library/jest-dom';

// Import directly instead of using require inside test functions
import * as useAuthModule from '../../../hooks/useAuth';

// Mock Next Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
    replace: jest.fn(),
    query: {},
    isReady: true,
    asPath: '/dashboard',
    route: '/dashboard'
  }),
}));

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((key: string) => {
    if (key === '/api/wallet/balance') {
      return {
        data: { balance: 5000 },
        isLoading: false,
        error: null,
        mutate: jest.fn()
      };
    }
    if (key && key.includes('/api/analytics/overview')) {
      return {
        data: {
          totalUsers: 120,
          activeAds: 30,
          totalImpressions: 5000,
          totalClicks: 250,
          totalSpent: 1500,
          recentActivity: []
        },
        isLoading: false,
        error: null
      };
    }
    return {
      data: null,
      isLoading: false,
      error: null,
      mutate: jest.fn()
    };
  })
}));

// Mock TestModeContext
jest.mock('../../../context/TestModeContext', () => {
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
    TestModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// Mock RoleContext
jest.mock('../../../context/RoleContext', () => {
  return {
    useRole: jest.fn().mockReturnValue({
      role: 'user',
      setRole: jest.fn(),
      availableRoles: ['user', 'advertiser', 'publisher'],
      isRoleAvailable: jest.fn().mockReturnValue(true),
    }),
    RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// Mock CurrencyContext
jest.mock('../../../context/CurrencyContext', () => {
  return {
    useCurrency: jest.fn().mockReturnValue({
      currency: 'BTC',
      toggleCurrency: jest.fn(),
      btcPrice: 50000,
      convertSatsToDollars: (sats: number) => (sats / 100000000) * 50000,
      convertDollarsToSats: (dollars: number) => (dollars / 50000) * 100000000,
      formatSats: (sats: number) => `${sats} sats`,
      formatDollars: (dollars: number) => `$${dollars.toFixed(2)}`,
      formatCurrency: (value: number) => `₿ ${(value / 100000000).toFixed(8)}`,
    }),
    CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
});

describe('Dashboard Index Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with authenticated user', () => {
    // Mock useAuth to return authenticated user
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      auth: { 
        pubkey: 'test-pubkey', 
        isTestMode: true, 
        isLoggedIn: true,
        user: {
          id: 'test-user-id',
          role: 'user',
          pubkey: 'test-pubkey',
          name: 'Test User',
          email: 'test@example.com'
        }
      },
      loading: false,
      error: null,
      login: jest.fn().mockResolvedValue(true),
      logout: jest.fn().mockResolvedValue(true)
    });

    render(<DashboardIndex />);
    
    // Just verify that something is rendered
    expect(document.body.textContent).toBeTruthy();
  });

  it('handles unauthenticated user', () => {
    // Mock useAuth to return unauthenticated user
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      auth: { isLoggedIn: false },
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    });
    
    render(<DashboardIndex />);
    
    // Just verify that something is rendered
    expect(document.body.textContent).toBeTruthy();
  });
});