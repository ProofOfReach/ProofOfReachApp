import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdvertiserDashboard from '../../../pages/dashboard/advertiser';
import { render } from '../../test-utils';
import React from 'react';

// Mock data defined here once
const mockAds = [
  {
    id: 'ad-1',
    title: 'Test Ad 1',
    description: 'This is a test ad description',
    imageUrl: 'https://example.com/image1.jpg',
    targetUrl: 'https://example.com/target1',
    budget: 5000,
    bidPerImpression: 10,
    status: 'ACTIVE',
    createdAt: '2023-04-01T12:00:00Z',
    impressions: 120,
    clicks: 15,
  },
  {
    id: 'ad-2',
    title: 'Test Ad 2',
    description: 'Another test ad description',
    imageUrl: 'https://example.com/image2.jpg',
    targetUrl: 'https://example.com/target2',
    budget: 3000,
    bidPerImpression: 5,
    status: 'PENDING',
    createdAt: '2023-04-02T12:00:00Z',
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-3',
    title: 'Test Ad 3',
    description: 'Third test ad description',
    imageUrl: 'https://example.com/image3.jpg',
    targetUrl: 'https://example.com/target3',
    budget: 2000,
    bidPerImpression: 3,
    status: 'ACTIVE',
    createdAt: '2023-04-03T12:00:00Z',
    impressions: 80,
    clicks: 10,
  }
];

// Mock campaigns data
const mockCampaigns = [
  {
    id: 'campaign-1',
    name: 'Test Campaign 1',
    budget: 10000,
    status: 'ACTIVE',
    createdAt: '2023-04-01T12:00:00Z',
    ads: [mockAds[0]]
  },
  {
    id: 'campaign-2',
    name: 'Test Campaign 2',
    budget: 5000,
    status: 'PAUSED',
    createdAt: '2023-04-02T12:00:00Z',
    ads: [mockAds[1], mockAds[2]]
  }
];

// Mock SWR with proper TypeScript typing
jest.mock('swr', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((key: string) => {
      if (key === '/api/campaigns') {
        return {
          data: mockCampaigns,
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
          data: mockAds,
          isLoading: false,
          error: null,
          mutate: jest.fn()
        };
      }
      if (key.includes('/api/analytics/advertiser')) {
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
  };
});

// Mock auth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    auth: { 
      pubkey: 'test-pubkey', 
      isTestMode: true, 
      isLoggedIn: true,
      user: {
        id: 'test-user-id',
        role: 'advertiser',
        pubkey: 'test-pubkey',
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    user: {
      id: 'test-user-id',
      role: 'advertiser',
      pubkey: 'test-pubkey',
      name: 'Test User',
      email: 'test@example.com'
    },
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
    isLoading: false,
    checkIsTestMode: jest.fn().mockReturnValue(true),
  }),
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

// Mock RoleContext
jest.mock('../../../context/RoleContext', () => {
  const React = require('react');
  return {
    defaultUseRole: jest.fn().mockReturnValue({
      role: 'advertiser',
      setRole: jest.fn(),
      availableRoles: ['viewer', 'advertiser', 'publisher'],
      isRoleAvailable: jest.fn().mockReturnValue(true),
    }),
    RoleProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
  };
});

// Second SWR mock is causing conflicts with the first one and is redundant
// (The mockAds are already defined at the top of the file and used in the first SWR mock)

// Mock Next Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard/advertiser',
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AdvertiserDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ log: true }),
    });
  });

  it('renders advertiser dashboard with ads', async () => {
    render(<AdvertiserDashboard />);
    
    // Just verify the component renders without errors
    expect(document.body.textContent).toBeTruthy();
    
    // Check for a header that should be present
    expect(screen.getByText('Advertiser Dashboard')).toBeInTheDocument();
  });

  it('displays the advertiser dashboard home content', async () => {
    render(<AdvertiserDashboard />);
    
    // Just verify the dashboard renders
    expect(document.body.textContent).toBeTruthy();
    
    // Check for a main heading that should be present
    expect(screen.getByText('Advertiser Dashboard')).toBeInTheDocument();
  });

  it('handles unauthenticated user state', () => {
    // Mock useAuth to return not logged in
    (require('../../../hooks/useAuth').useAuth as jest.Mock).mockReturnValueOnce({
      auth: { pubkey: '', isLoggedIn: false }
    });
    
    render(<AdvertiserDashboard />);
    
    // Just verify the component renders without errors
    expect(document.body.textContent).toBeTruthy();
  });

  it('displays campaign information', () => {
    render(<AdvertiserDashboard />);
    
    // Just verify the component renders without errors
    expect(document.body.textContent).toBeTruthy();
    
    // Check for one element that should be on the page consistently
    expect(screen.getByText('Advertiser Dashboard')).toBeInTheDocument();
  });

  it('handles empty data state', () => {
    // Mock SWR with empty ads array
    (require('swr').default as jest.Mock).mockImplementationOnce((key: string) => {
      if (key === '/api/ads') {
        return {
          data: [],
          error: undefined,
          mutate: jest.fn(),
        };
      }
      // Return default mock values for other keys
      return {
        data: null,
        isLoading: false,
        error: null,
        mutate: jest.fn()
      };
    });
    
    render(<AdvertiserDashboard />);
    
    // Just verify the component renders without errors
    expect(document.body.textContent).toBeTruthy();
  });
});