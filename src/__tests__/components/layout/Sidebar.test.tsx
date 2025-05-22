import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from '../../../components/layout/Sidebar';
import { RoleProvider, UserRole } from '../../../context/RoleContext';
import { RoleProviderRefactored } from '../../../context/NewRoleContextRefactored';
import * as useAuthModule from '../../../hooks/useAuth';
import * as useAuthRefactoredModule from '../../../hooks/useAuthRefactored';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react-dom/test-utils';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: any }) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

// Mock react-feather icons
jest.mock('react-feather', () => ({
  User: () => <div data-testid="user-icon" />,
  Volume2: () => <div data-testid="volume-icon" />,
  Edit3: () => <div data-testid="edit-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Home: () => <div data-testid="home-icon" />,
  PieChart: () => <div data-testid="piechart-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  List: () => <div data-testid="list-icon" />,
  CheckSquare: () => <div data-testid="checksquare-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Code: () => <div data-testid="code-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

// Mock custom components
jest.mock('../../../components/icons/MegaphoneIcon', () => () => <div data-testid="megaphone-icon" />);
jest.mock('../../../components/icons/SatsIcon', () => () => <div data-testid="sats-icon" />);
jest.mock('../../../components/CurrencyToggle', () => () => <div data-testid="currency-toggle" />);
jest.mock('../../../components/ExchangeRateDisplay', () => () => <div data-testid="exchange-rate" />);

// Create a mock QueryClient for testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component that provides all necessary context providers
const AllProvidersWrapper: React.FC<{ 
  children: React.ReactNode; 
  initialRole?: UserRole;
}> = ({ 
  children, 
  initialRole = 'viewer' 
}) => {
  const testQueryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <RoleProvider initialRole={initialRole}>
        <RoleProviderRefactored initialRole={initialRole}>
          {children}
        </RoleProviderRefactored>
      </RoleProvider>
    </QueryClientProvider>
  );
};

// Create a type-safe mock of window.location
interface LocationMock {
  href: string;
  assign: jest.Mock;
  replace: jest.Mock;
  reload: jest.Mock;
  toString: jest.Mock;
  ancestorOrigins: DOMStringList;
  hash: string;
  host: string;
  hostname: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
}

// Mock the entire window.location for all tests
const mockWindowLocation = () => {
  // Store original location and create backup
  const originalLocation = window.location;
  
  // Create a mock with all expected properties
  const locationMock: LocationMock = {
    href: '/dashboard',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    toString: jest.fn().mockReturnValue('/dashboard'),
    ancestorOrigins: { length: 0 } as unknown as DOMStringList,
    hash: '',
    host: 'localhost',
    hostname: 'localhost',
    origin: 'http://localhost',
    pathname: '/dashboard',
    port: '',
    protocol: 'http:',
    search: '',
  };

  // Create a temporary object for window.location
  const tempLocation = {} as Location;
  
  // Mock the location property with our temp object
  Object.defineProperty(window, 'location', {
    value: tempLocation,
    writable: true,
    configurable: true
  });
  
  // Setup the properties on the mocked location
  for (const key in locationMock) {
    Object.defineProperty(tempLocation, key, {
      value: (locationMock as any)[key],
      writable: true,
      configurable: true
    });
  }

  return { 
    originalLocation: originalLocation as Location, 
    locationMock 
  };
};

describe('Sidebar Component', () => {
  let locationMock: LocationMock;
  let originalLocation: Location;

  beforeEach(() => {
    // Clear any previous localStorage mock data
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    
    // Setup location mock
    const mocks = mockWindowLocation();
    originalLocation = mocks.originalLocation;
    locationMock = mocks.locationMock;
    
    // Mock useAuth hook with a new instance each time
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      auth: {
        pubkey: 'test-pubkey',
        isLoggedIn: true,
        isTestMode: false,
        availableRoles: ['viewer', 'advertiser', 'publisher'],
        profile: null
      },
      login: jest.fn().mockResolvedValue(true),
      logout: jest.fn().mockResolvedValue(undefined),
      refreshRoles: jest.fn().mockResolvedValue(['viewer', 'advertiser', 'publisher']),
      addRole: jest.fn().mockResolvedValue(true),
      removeRole: jest.fn().mockResolvedValue(true)
    });
    
    // Mock useAuthRefactored hook
    jest.spyOn(useAuthRefactoredModule, 'useAuthRefactored').mockReturnValue({
      authState: {
        isLoggedIn: true,
        pubkey: 'npub_test123456789',
        isTestMode: false,
        availableRoles: ['viewer', 'advertiser', 'publisher'],
      },
      login: jest.fn().mockResolvedValue({
        isLoggedIn: true,
        pubkey: 'npub_test123456789',
        isTestMode: false,
        availableRoles: ['viewer', 'advertiser', 'publisher']
      }),
      logout: jest.fn().mockResolvedValue(undefined),
      refreshRoles: jest.fn().mockResolvedValue({
        isLoggedIn: true,
        pubkey: 'npub_test123456789',
        isTestMode: false,
        availableRoles: ['viewer', 'advertiser', 'publisher']
      }),
      addRole: jest.fn().mockResolvedValue(true),
      removeRole: jest.fn().mockResolvedValue(true),
      hasRole: jest.fn().mockImplementation((role) => 
        ['viewer', 'advertiser', 'publisher'].includes(role)
      ),
      isLoading: false
    });
  });
  
  afterEach(() => {
    // Restore original window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
    jest.resetAllMocks();
  });

  it('renders with viewer role by default', () => {
    render(
      <AllProvidersWrapper initialRole="viewer">
        <Sidebar />
      </AllProvidersWrapper>
    );
    
    // Check if role selector exists
    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByTestId('viewer-icon-container')).toBeInTheDocument();
    
    // Check if viewer menu items are displayed
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Nostr Feed')).toBeInTheDocument();
    expect(screen.getByText('Wallet')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
  
  it('shows correct role options in dropdown', () => {
    render(
      <AllProvidersWrapper initialRole="viewer">
        <Sidebar />
      </AllProvidersWrapper>
    );
    
    // Open the dropdown
    fireEvent.click(screen.getByText('Viewer'));
    
    // Since Viewer is active, dropdown should show other roles
    expect(screen.getByText('Advertiser')).toBeInTheDocument();
    expect(screen.getByText('Publisher')).toBeInTheDocument();
    expect(screen.getByTestId('megaphone-icon')).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
  });
  
  it('triggers navigation when role is changed', async () => {
    // Mock window.confirm to return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    
    render(
      <AllProvidersWrapper initialRole="viewer">
        <Sidebar />
      </AllProvidersWrapper>
    );
    
    // Initially in viewer role
    expect(screen.getByText('Nostr Feed')).toBeInTheDocument();
    
    // Open dropdown and change to advertiser role
    fireEvent.click(screen.getByText('Viewer'));
    fireEvent.click(screen.getByText('Advertiser'));
    
    // In the actual component, we directly update window.location.href
    // But in tests, we need to check for the function call in our mock
    // We now expect '/dashboard' instead of '/dashboard/advertiser' due to feature-based URL structure
    await waitFor(() => {
      expect(locationMock.assign).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  it('applies correct styling to role buttons', () => {
    render(
      <AllProvidersWrapper initialRole="viewer">
        <Sidebar />
      </AllProvidersWrapper>
    );
    
    // Default role is viewer, check if it has blue styling
    const roleButton = screen.getByText('Viewer').closest('button');
    expect(roleButton?.className).toContain('bg-blue-100');
    
    // Open dropdown
    fireEvent.click(screen.getByText('Viewer'));
    
    // Advertiser button should be visible with default styling
    const advertiserOption = screen.getByText('Advertiser').closest('button');
    expect(advertiserOption?.className).not.toContain('bg-orange-100');
  });
  
  it('renders the logout button and calls logout when clicked', async () => {
    // Mock window.confirm to return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    
    const mockRouter = { pathname: '/dashboard', push: jest.fn() };
    jest.spyOn(require('next/router'), 'useRouter').mockReturnValue(mockRouter);
    
    // Setup mocks for both auth hooks
    const mockLogout = jest.fn().mockResolvedValue(undefined);
    
    // Mock classic auth hook
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      auth: {
        pubkey: 'test-pubkey',
        isLoggedIn: true,
        isTestMode: false,
        availableRoles: ['viewer'],
        profile: null
      },
      login: jest.fn(),
      logout: mockLogout,
      refreshRoles: jest.fn(),
      addRole: jest.fn(),
      removeRole: jest.fn()
    });
    
    // Mock refactored auth hook
    jest.spyOn(useAuthRefactoredModule, 'useAuthRefactored').mockReturnValue({
      authState: {
        isLoggedIn: true,
        pubkey: 'npub_test123456789',
        isTestMode: false,
        availableRoles: ['viewer'],
      },
      login: jest.fn().mockResolvedValue({
        isLoggedIn: true,
        pubkey: 'npub_test123456789',
        isTestMode: false,
        availableRoles: ['viewer']
      }),
      logout: jest.fn().mockResolvedValue(undefined),
      refreshRoles: jest.fn().mockResolvedValue({
        isLoggedIn: true,
        pubkey: 'npub_test123456789',
        isTestMode: false,
        availableRoles: ['viewer']
      }),
      addRole: jest.fn().mockResolvedValue(true),
      removeRole: jest.fn().mockResolvedValue(true),
      hasRole: jest.fn().mockReturnValue(true),
      isLoading: false
    });
    
    render(
      <AllProvidersWrapper initialRole="viewer">
        <Sidebar />
      </AllProvidersWrapper>
    );
    
    // Check if logout button is present
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    
    // Click the logout button using act to handle state updates
    await act(async () => {
      fireEvent.click(logoutButton);
    });
    
    // Check if logout was called
    // If our component actually uses the auth.logout() function
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
    
    // Either logout was called, or we navigated to logout page
    // The component has two possible paths for logout
    await waitFor(() => {
      const wasLogoutCalled = mockLogout.mock.calls.length > 0;
      const wasRouterUsed = mockRouter.push.mock.calls.length > 0;
      const wasLocationUsed = locationMock.assign.mock.calls.length > 0 || 
                             locationMock.href.includes('/system/logout');
                             
      expect(wasLogoutCalled || wasRouterUsed || wasLocationUsed).toBe(true);
    });
  });
});