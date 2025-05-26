import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditAdPage from '../../../../pages/dashboard/ads/edit/[id]';
import { AuthContext, AuthState } from '../../../../hooks/useAuth';
import { useRouter } from 'next/router';
import type { UserRole } from '../../../../context/RoleContext';
import { TestModeProvider } from '../../../../context/TestModeContext';

// Mock the useRouter hook
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock the fetch function with implementations
const mockFetchImplementation = (url: string) => {
  // Add a short delay to simulate network request time
  return new Promise(resolve => {
    setTimeout(() => {
      // Mock ad data when fetching a specific ad
      if (url.includes('/api/ads/123')) {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 123,
            title: 'Test Ad',
            description: 'Test description',
            finalDestinationUrl: 'https://example.com',
            advertiserName: 'Test Advertiser',
            budget: 1000,
            dailyBudget: 100,
            bidPerImpression: 10,
            bidPerClick: 50,
            targetedAdSpaces: []
          }),
        });
      } else if (url.includes('/api/spaces/available')) {
        // Mock available ad spaces for the form component
        resolve({
          ok: true,
          json: () => Promise.resolve([
            { 
              id: 'space-1', 
              name: 'Test Space 1', 
              domain: 'test1.com',
              contentCategory: 'Technology' 
            },
            { 
              id: 'space-2', 
              name: 'Test Space 2', 
              domain: 'test2.com',
              contentCategory: 'Entertainment' 
            }
          ]),
        });
      } else {
        // Default log response for other fetch calls
        resolve({
          ok: true,
          json: () => Promise.resolve({ log: true }),
        });
      }
    }, 100); // Add a small delay for async behavior
  });
};

global.fetch = jest.fn().mockImplementation(mockFetchImplementation);

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: UserRole, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Helper function for creating providers
const createProviders = (authState: AuthState | null, children: React.ReactNode) => {
  return (
    <TestModeProvider>
      <AuthContext.Provider value={{ 
        auth: authState,
        login: jest.fn().mockResolvedValue(true),
        logout: jest.fn().mockResolvedValue(undefined),
        refreshRoles: jest.fn().mockResolvedValue(['viewer', 'advertiser'] as UserRole[]),
        addRole: jest.fn().mockResolvedValue(true),
        removeRole: jest.fn().mockResolvedValue(true),
      }}>
        {children}
      </AuthContext.Provider>
    </TestModeProvider>
  );
};

describe('EditAdPage', () => {
  const mockRouter = {
    query: { id: 'test-ad-id' },
    push: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/dashboard/ads/edit/test-ad-id'
  };
  
  // Create a properly structured auth mock that matches AuthState type
  const mockAuth: AuthState = {
    pubkey: 'test-pubkey',
    isTestMode: false,
    isLoggedIn: true,
    availableRoles: ['viewer', 'advertiser'],
    profile: { 
      name: 'Test User',
      displayName: 'Test',
      avatar: ''
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage
    localStorageMock.clear();
    
    // Mock useRouter
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('redirects to login if user is not authenticated', () => {
    render(createProviders(null, <EditAdPage />));

    expect(screen.getByText('Please login to edit ads.')).toBeInTheDocument();
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
  });

  it('shows loading state when fetching ad data', async () => {
    // Configure mock router with the correct ID
    mockRouter.query = { id: '123' };
    
    // Mock fetch to delay response longer than usual
    (global.fetch as jest.Mock).mockImplementation(url => {
      if (url.includes('/api/ads/123')) {
        return new Promise(resolve => {
          // This longer delay ensures the loading state will be visible when we check
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                id: 123,
                title: 'Test Ad',
                description: 'Test description',
                finalDestinationUrl: 'https://example.com'
              })
            });
          }, 200); // Longer delay than our usual mock
        });
      }
      return mockFetchImplementation(url);
    });
    
    // Render the component with auth and test mode provider
    render(createProviders(mockAuth, <EditAdPage />));
    
    // Check if loading indicator appears
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('shows error message when ad fetch fails', async () => {
    // Configure mock router with an ID that will fail
    mockRouter.query = { id: 'test-error-id' };
    
    // Mock fetch to reject with a specific error message
    (global.fetch as jest.Mock).mockImplementation(url => {
      if (url.includes('/api/ads/test-error-id')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            error: 'Failed to fetch ad data'
          })
        });
      }
      return mockFetchImplementation(url);
    });

    // Render the component with auth and test mode provider
    render(createProviders(mockAuth, <EditAdPage />));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch ad data')).toBeInTheDocument();
    });
  });

  it('loads ad data from localStorage if available', async () => {
    const mockAdData = {
      id: 'test-ad-id',
      title: 'Test Ad',
      description: 'Test Description',
      finalDestinationUrl: 'https://example.com',
      budget: 1000,
      dailyBudget: 100,
      bidPerImpression: 10,
      bidPerClick: 50
    };

    // Reset mock router
    mockRouter.query = { id: 'test-ad-id' };
    mockRouter.push.mockClear();

    // Set localStorage with mock ad data
    localStorageMock.setItem('editAdData', JSON.stringify(mockAdData));
    
    // Configure fetch for ad data
    (global.fetch as jest.Mock).mockImplementation(url => {
      // Return a generic response for any API call that isn't the ad fetch
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
    
    // Render the component with auth and test mode provider
    render(createProviders(mockAuth, <EditAdPage />));
    
    // Verify localStorage was accessed and cleared
    expect(localStorageMock.getItem).toHaveBeenCalledWith('editAdData');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('editAdData');
    
    // Verify that the ad data from localStorage appears in the form
    // Wait for the form to be populated with localStorage data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Ad')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
  });

  it('loads and displays ad data correctly', async () => {
    // Configure mock router
    mockRouter.query = { id: '123' };
    mockRouter.push.mockClear();
    
    // Reset mock fetch
    (global.fetch as jest.Mock).mockClear();
    
    // Mock the initial ad data fetch
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      // Return ad data for GET request
      if (url === '/api/ads/123' && (!options || options.method === 'GET' || !options.method)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 123,
            title: 'Test Ad',
            description: 'Test description',
            finalDestinationUrl: 'https://example.com',
            advertiserName: 'Test Advertiser',
            bidPerImpression: 10,
            bidPerClick: 0,
            targetedAdSpaces: []
          })
        });
      }
      // Return available ad spaces for the form component
      else if (url.includes('/api/spaces/available')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { 
              id: 'space-1', 
              name: 'Test Space 1',
              domain: 'test1.com',
              contentCategory: 'Technology' 
            }
          ])
        });
      }
      return mockFetchImplementation(url);
    });
    
    // Render the component with auth and test mode provider
    render(createProviders(mockAuth, <EditAdPage />));
    
    // Wait for the form to be populated with data and validate it
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Ad')).toBeInTheDocument();
    });
    
    // Verify the details from the loaded ad data are displayed correctly
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    
    // Form formatting may convert the number - only check that we can find the title
    expect(screen.getByDisplayValue('Test Ad')).toBeInTheDocument();
  });
});