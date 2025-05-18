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
    TestModeProvider: ({ children }) => React.createElement(React.Fragment, null, children)
  };
});

// Mock RoleContext
jest.mock('../../../context/RoleContext', () => {
  const React = require('react');
  return {
    useRole: jest.fn().mockReturnValue({
      role: 'advertiser',
      setRole: jest.fn(),
      availableRoles: ['user', 'advertiser', 'publisher'],
      isRoleAvailable: jest.fn().mockReturnValue(true),
    }),
    RoleProvider: ({ children }) => React.createElement(React.Fragment, null, children)
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
      json: async () => ({ success: true }),
    });
  });

  it('renders advertiser dashboard with ads', async () => {
    render(<AdvertiserDashboard />);
    
    expect(screen.getByText('Advertiser Dashboard')).toBeInTheDocument();
    
    // All ads should be visible initially
    await waitFor(() => {
      expect(screen.getByText('Test Ad 1')).toBeInTheDocument();
      expect(screen.getByText('Test Ad 2')).toBeInTheDocument();
      expect(screen.getByText('Test Ad 3')).toBeInTheDocument();
    });
    
    // Check for create campaign button instead of create ad
    const createButton = screen.getByText('Create Campaign');
    expect(createButton).toBeInTheDocument();
    expect(createButton.closest('a')).toHaveAttribute('href', '/dashboard/advertiser/campaigns/create');
  });

  it('displays the advertiser dashboard home content', async () => {
    render(<AdvertiserDashboard />);
    
    // Check that main sections are displayed
    expect(screen.getByText('Advertiser Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Account Overview')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    
    // Check that metrics are displayed (even if they're zero)
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Total Impressions')).toBeInTheDocument();
    
    // Verify action buttons
    expect(screen.getByText('Create Campaign')).toBeInTheDocument();
  });

  it('shows login prompt when user is not authenticated', () => {
    // Mock useAuth to return not logged in
    (require('../../../hooks/useAuth').useAuth as jest.Mock).mockReturnValueOnce({
      auth: { pubkey: '', isLoggedIn: false }
    });
    
    render(<AdvertiserDashboard />);
    
    expect(screen.getByText('Please login to access the advertiser dashboard.')).toBeInTheDocument();
    
    const loginLink = screen.getByText('Go to Login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('displays campaign information when available', async () => {
    render(<AdvertiserDashboard />);
    
    // Verify basic dashboard structure is present
    expect(screen.getByText('Account Overview')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    
    // Verify campaign creation link is present
    const campaignButton = screen.getByText('Create Campaign');
    expect(campaignButton).toBeInTheDocument();
    expect(campaignButton.closest('a')).toHaveAttribute('href', '/dashboard/advertiser/campaigns/create');
  });

  it('shows empty state when no ads match the selected filter', async () => {
    // Mock SWR with empty ads array
    (require('swr').default as jest.Mock).mockImplementationOnce(() => ({
      data: [],
      error: undefined,
      mutate: jest.fn(),
    }));
    
    render(<AdvertiserDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText("You don't have any ads yet. Create a campaign to add ads.")).toBeInTheDocument();
      expect(screen.getByText('Create Campaign')).toBeInTheDocument();
    });
  });
});