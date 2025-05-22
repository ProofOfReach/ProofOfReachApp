import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import CreateAdPage from '../../../../pages/dashboard/ads/create';
import { AuthContext, AuthState } from '../../../../hooks/useAuth';
import * as api from '../../../../lib/api';
import { UserRole } from '../../../../context/RoleContext';

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the API utils
jest.mock('../../../../lib/api', () => ({
  postWithAuth: jest.fn(),
}));

// Mock fetch for wallet balance
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ balance: 5000 }),
  })
);

// Mock SatoshiIcon
jest.mock('../../../../components/SatoshiIcon', () => {
  return function MockSatoshiIcon(props: any) {
    return <span data-testid="satoshi-icon" {...props} />;
  };
});

// Mock AdForm component
jest.mock('../../../../components/AdForm', () => {
  return function MockAdForm({ onSubmit }: { onSubmit: (data: any) => void }) {
    return (
      <div data-testid="ad-form">
        <button 
          onClick={() => onSubmit({ 
            title: 'Test Ad', 
            description: 'Test Description', 
            finalDestinationUrl: 'https://example.com',
            budget: 5000,
            dailyBudget: 1000, 
            bidPerImpression: 10, 
            bidPerClick: 100 
          })}
          data-testid="submit-ad-form"
        >
          Submit Ad
        </button>
      </div>
    );
  };
});

// Helper function for creating an AuthContext provider
const createAuthProvider = (authState: AuthState | null, children: React.ReactNode) => {
  return (
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
  );
};

describe('CreateAdPage', () => {
  const mockPush = jest.fn();
  // Create a properly structured auth mock that matches AuthState type
  const mockAuth: AuthState = {
    pubkey: 'test-pubkey',
    isLoggedIn: true,
    isTestMode: false,
    availableRoles: ['viewer', 'advertiser'],
    profile: {
      name: 'Test User',
      displayName: 'Test',
      avatar: '',
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders login prompt when not authenticated', () => {
    render(createAuthProvider(null, <CreateAdPage />));

    expect(screen.getByText('Please login to create ads.')).toBeInTheDocument();
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
  });

  it('renders the ad creation form when authenticated', () => {
    render(createAuthProvider(mockAuth, <CreateAdPage />));

    expect(screen.getByText('Create New Ad')).toBeInTheDocument();
    expect(screen.getByTestId('ad-form')).toBeInTheDocument();
  });

  it('redirects to campaigns dashboard on successful ad creation', async () => {
    (api.postWithAuth as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-ad-id' }),
    });

    render(createAuthProvider(mockAuth, <CreateAdPage />));

    fireEvent.click(screen.getByTestId('submit-ad-form'));

    await waitFor(() => {
      expect(api.postWithAuth).toHaveBeenCalledWith('/api/ads', expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/dashboard/campaigns');
    });
  });

  it('shows wallet funding prompt when balance is insufficient', async () => {
    (api.postWithAuth as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Insufficient balance to create this ad' }),
    });

    render(createAuthProvider(mockAuth, <CreateAdPage />));

    fireEvent.click(screen.getByTestId('submit-ad-form'));

    await waitFor(() => {
      expect(screen.getByText('Insufficient Balance')).toBeInTheDocument();
      expect(screen.getByText('Fund Your Wallet')).toBeInTheDocument();
      expect(screen.getByText('Check Balance & Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Back to Edit Ad')).toBeInTheDocument();
    });
  });

  it('shows generic error message for other errors', async () => {
    (api.postWithAuth as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Some other error' }),
    });

    render(createAuthProvider(mockAuth, <CreateAdPage />));

    fireEvent.click(screen.getByTestId('submit-ad-form'));

    await waitFor(() => {
      expect(screen.getByText('Some other error')).toBeInTheDocument();
    });
  });

  it('handles cancel funding and returns to edit form', async () => {
    // First mock insufficient balance response
    (api.postWithAuth as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Insufficient balance to create this ad' }),
    });

    render(createAuthProvider(mockAuth, <CreateAdPage />));

    // Submit form to trigger insufficient balance error
    fireEvent.click(screen.getByTestId('submit-ad-form'));

    // Wait for wallet funding prompt to appear
    await waitFor(() => {
      expect(screen.getByText('Insufficient Balance')).toBeInTheDocument();
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Go Back to Edit Ad'));

    // Check if we're back to the ad form
    await waitFor(() => {
      expect(screen.queryByText('Insufficient Balance')).not.toBeInTheDocument();
      expect(screen.getByTestId('ad-form')).toBeInTheDocument();
    });
  });

  it('attempts to resubmit ad after clicking try again', async () => {
    // First mock insufficient balance response
    (api.postWithAuth as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Insufficient balance to create this ad' }),
    });

    // Then mock a successful response for the retry
    (api.postWithAuth as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-ad-id' }),
    });

    // Mock fetch for checking balance before retry (sufficient funds)
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ balance: 10000 }),
      })
    );

    render(createAuthProvider(mockAuth, <CreateAdPage />));

    // Submit form to trigger insufficient balance error
    fireEvent.click(screen.getByTestId('submit-ad-form'));

    // Wait for wallet funding prompt to appear
    await waitFor(() => {
      expect(screen.getByText('Insufficient Balance')).toBeInTheDocument();
    });

    // Click try again button
    fireEvent.click(screen.getByText('Check Balance & Try Again'));

    // Check if redirect happened after successful retry
    await waitFor(() => {
      expect(api.postWithAuth).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenCalledWith('/dashboard/campaigns');
    });
  });
});