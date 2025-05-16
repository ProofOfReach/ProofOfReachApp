import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import types and interfaces needed
type UserRole = 'user' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

// Define options interface for our custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRole?: UserRole;
  authenticated?: boolean; 
}

// Mock modules outside component - ensure this is at file scope
jest.mock('../context/RoleContext', () => {
  return {
    useRole: jest.fn().mockReturnValue({
      role: 'user', // This will be overridden in the render function
      setRole: jest.fn(),
      availableRoles: ['user', 'advertiser', 'publisher', 'admin'],
      isRoleAvailable: jest.fn().mockReturnValue(true),
    }),
    RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

jest.mock('../context/TestModeContext', () => {
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

jest.mock('../context/CurrencyContext', () => {
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

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    auth: { 
      pubkey: 'test-pubkey', 
      isTestMode: true, 
      isLoggedIn: true, // This will be overridden in the render function
      user: {
        id: 'test-user-id',
        role: 'user', // This will be overridden in the render function
        pubkey: 'test-pubkey',
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    loading: false,
    error: null,
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn().mockResolvedValue(true)
  })
}));

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

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((key: string) => {
    if (key === '/api/campaigns') {
      return {
        data: [
          {
            id: 'campaign-1',
            name: 'Test Campaign 1',
            budget: 10000,
            status: 'ACTIVE',
            createdAt: '2023-04-01T12:00:00Z',
            ads: [{
              id: 'ad-1',
              title: 'Test Ad 1',
              description: 'Test description',
              status: 'ACTIVE'
            }]
          }
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn()
      };
    }
    if (key === '/api/wallet/balance') {
      return {
        data: { balance: 5000 },
        isLoading: false,
        error: null,
        mutate: jest.fn()
      };
    }
    if (key === '/api/ads') {
      return {
        data: [
          {
            id: 'ad-1',
            title: 'Test Ad 1',
            description: 'Test description',
            status: 'ACTIVE'
          }
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn()
      };
    }
    if (key && key.includes('/api/analytics')) {
      return {
        data: {
          totalImpressions: 500,
          totalClicks: 50,
          totalSpent: 1500,
          ctr: 0.1,
          daily: []
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

/**
 * Custom render function that wraps the UI with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialRole = 'user',
    authenticated = true,
    ...renderOptions
  } = options;

  // Override mock implementations based on options
  const useRoleMock = require('../context/RoleContext').useRole;
  useRoleMock.mockReturnValue({
    role: initialRole,
    setRole: jest.fn(),
    availableRoles: ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'],
    isRoleAvailable: jest.fn().mockReturnValue(true),
  });

  const useAuthMock = require('../hooks/useAuth').useAuth;
  useAuthMock.mockReturnValue({
    auth: { 
      pubkey: 'test-pubkey', 
      isTestMode: true, 
      isLoggedIn: authenticated,
      user: authenticated ? {
        id: 'test-user-id',
        role: initialRole,
        pubkey: 'test-pubkey',
        name: 'Test User',
        email: 'test@example.com'
      } : null
    },
    loading: false,
    error: null,
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn().mockResolvedValue(true)
  });
  
  const useTestModeMock = require('../context/TestModeContext').useTestMode;
  useTestModeMock.mockReturnValue({
    isTestMode: true,
    enableTestMode: jest.fn(),
    disableTestMode: jest.fn(),
    timeRemaining: 240,
    enableAllRoles: jest.fn().mockResolvedValue(true),
    setCurrentRole: jest.fn().mockImplementation(async (role: string) => {
      useRoleMock.mockReturnValueOnce({
        role: role,
        setRole: jest.fn(),
        availableRoles: ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'],
        isRoleAvailable: jest.fn().mockReturnValue(true),
      });
      return true;
    }),
    isTestModeAvailable: true,
    isDevEnvironment: true,
    isDevelopment: true
  });

  // Create wrapper with all necessary providers
  function AllProviders({ children }: { children: ReactNode }) {
    // Just return children directly
    return <>{children}</>;
  }

  // Return rendered UI with providers
  return render(ui, { wrapper: AllProviders, ...renderOptions });
}

// Export a mocked useAuth hook for direct use
export const mockUseAuth = (authenticated: boolean = true, role: UserRole = 'user') => {
  return {
    auth: { 
      pubkey: 'test-pubkey', 
      isTestMode: true, 
      isLoggedIn: authenticated,
      user: authenticated ? {
        id: 'test-user-id',
        role: role,
        pubkey: 'test-pubkey',
        name: 'Test User',
        email: 'test@example.com'
      } : null
    },
    loading: false,
    error: null,
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn().mockResolvedValue(true)
  };
};