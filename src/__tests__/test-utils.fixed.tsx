import * as React from 'react';
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleProvider } from '../context/RoleContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserRole } from '../types/role';

// Set up mocks first, before imports  
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
    TestModeProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
  };
});

// Mock the hooks and contexts
jest.mock('../hooks/useAuthRefactored', () => ({
  useAuthRefactored: () => ({
    authState: {
      roles: ['viewer', 'advertiser'] as UserRole[],
      isAuthenticated: true,
    },
    refreshRoles: jest.fn(),
    hasRole: jest.fn().mockReturnValue(true),
    assignRole: jest.fn().mockResolvedValue(true),
    removeRole: jest.fn().mockResolvedValue(true),
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn().mockResolvedValue(undefined),
  })
}));

// Mock the NewRoleContextRefactored
jest.mock('../context/NewRoleContextRefactored', () => {
  const ALL_ROLES = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as const;
  
  // Create a mock context with a proper Provider component
  const mockContext = React.createContext({
    role: 'advertiser',
    setRole: jest.fn(),
    availableRoles: ['viewer', 'advertiser', 'publisher'],
    isRoleAvailable: jest.fn().mockReturnValue(true),
    hasPermission: jest.fn().mockReturnValue(true),
    checkPermission: jest.fn().mockReturnValue(true),
    hasCapability: jest.fn().mockReturnValue(true),
    getRoleCapabilities: jest.fn().mockReturnValue({
      canAccessDashboard: true,
      canCreateAds: true,
      canManageAdSpaces: true,
      canViewAnalytics: true,
      canManageAPIKeys: true,
      canManageWallet: true,
    }),
  });
  
  const RoleProviderRefactored = ({ 
    children, 
    initialRole = 'advertiser' 
  }: { 
    children: React.ReactNode; 
    initialRole?: string 
  }) => {
    const [role, setRole] = React.useState(initialRole);
    
    const mockSetRole = jest.fn().mockImplementation((newRole: string) => {
      setRole(newRole);
      return Promise.resolve(true);
    });
    
    const contextValue = {
      role,
      setRole: mockSetRole,
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      isRoleAvailable: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
      checkPermission: jest.fn().mockReturnValue(true),
      hasCapability: jest.fn().mockReturnValue(true),
      getRoleCapabilities: jest.fn().mockReturnValue({
        canAccessDashboard: true,
        canCreateAds: true,
        canManageAdSpaces: true,
        canViewAnalytics: true,
        canManageAPIKeys: true,
        canManageWallet: true,
      }),
    };
    
    return React.createElement(mockContext.Provider, { value: contextValue }, children);
  };
  
  const defaultUseRole = () => React.useContext(mockContext);
  
  return {
    __esModule: true,
    ALL_ROLES,
    NewRoleContextRefactored: mockContext,
    RoleProviderRefactored,
    defaultUseRole,
    useNewRole: () => ({
      currentRole: 'advertiser',
      hasPermission: jest.fn().mockReturnValue(true),
      setCurrentRole: jest.fn(),
      checkPermission: jest.fn().mockReturnValue(true),
      isRoleAvailable: jest.fn().mockReturnValue(true),
      hasCapability: jest.fn().mockReturnValue(true),
      getRoleCapabilities: jest.fn().mockReturnValue({
        canAccessDashboard: true,
        canCreateAds: true,
        canManageAdSpaces: true,
        canViewAnalytics: true,
        canManageAPIKeys: true,
        canManageWallet: true,
      }),
    }),
  };
});

// Mock Next.js router with all required methods
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(() => ({
    pathname: '/dashboard',
    query: {},
    asPath: '/dashboard',
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    prefetch: jest.fn().mockResolvedValue(true),
    back: jest.fn(),
    reload: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    }
  })),
}));

// Define custom options type
type CustomRenderOptions = {
  skipRoleProvider?: boolean;
  initialRole?: string;
} & Omit<RenderOptions, 'wrapper'>;

// Create a fresh QueryClient for each test to avoid shared state
const createTestQueryClient = () => 
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, 
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

const { TestModeProvider } = require('../context/TestModeContext');
const { RoleProviderRefactored } = require('../context/NewRoleContextRefactored');

// Custom render that includes providers
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    // Use either the provided auth context or the default mock
    // Cast to the appropriate role type to avoid type errors
    const initialRole = (options?.initialRole || "advertiser") as UserRole & UserRole;
    const queryClient = createTestQueryClient();
    
    // Always wrap with QueryClientProvider first as innermost wrapper
    let wrappedUI = (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    // Add RoleProvider if not explicitly skipped
    if (!options?.skipRoleProvider) {
      // First wrap with RoleProvider
      wrappedUI = (
        <RoleProvider initialRole={initialRole}>
          {wrappedUI}
        </RoleProvider>
      );
      
      // Then wrap with RoleProviderRefactored
      wrappedUI = (
        <RoleProviderRefactored initialRole={initialRole}>
          {wrappedUI}
        </RoleProviderRefactored>
      );
      
      // Finally wrap with TestModeProvider
      wrappedUI = (
        <TestModeProvider>
          {wrappedUI}
        </TestModeProvider>
      );
    }
    
    return wrappedUI;
  }

  // Use our wrapper function
  return render(ui, { wrapper: Wrapper, ...options });
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };