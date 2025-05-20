import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewerOnboarding from '@/components/onboarding/ViewerOnboarding';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';

// Mock the onboardingService
jest.mock('@/lib/onboardingService', () => ({
  updateOnboardingProgress: jest.fn().mockResolvedValue(true),
  getOnboardingProgress: jest.fn().mockResolvedValue({
    completed: false,
    currentStep: 1,
    totalSteps: 3,
    role: 'viewer',
  }),
  isOnboardingComplete: jest.fn().mockResolvedValue(false),
}));

// Mock auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    auth: { pubkey: 'test-pubkey' },
    isAuthenticated: true,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock role context
jest.mock('@/context/RoleContext', () => ({
  useRole: jest.fn().mockReturnValue({
    currentRole: 'viewer',
    hasRole: jest.fn().mockReturnValue(true),
    availableRoles: ['viewer', 'publisher', 'advertiser'],
    loading: false,
  }),
  RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock OnboardingProgress component
jest.mock('@/components/onboarding/OnboardingProgress', () => ({
  __esModule: true,
  default: () => <div data-testid="onboarding-progress">Onboarding Progress</div>,
}));

describe('ViewerOnboarding', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first step content initially', () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding 
              onComplete={mockOnComplete} 
              showNavigation={true} 
            />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Should display the welcome title
    expect(screen.getByRole('heading', { name: /welcome to nostr ads/i })).toBeInTheDocument();

    // Should display navigation buttons
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
  });

  it('navigates to the next step when Next button is clicked', async () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding 
              onComplete={mockOnComplete} 
              showNavigation={true}
            />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Make sure we're on the first step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome to nostr ads/i })).toBeInTheDocument();
    });

    // Click the Next button using data-testid
    await act(async () => {
      userEvent.click(screen.getByTestId('next-button'));
    });

    // Should now display the second step content - using waitFor for async transitions
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /discover personalized content/i })).toBeInTheDocument();
    });

    // Should have Back and Continue buttons
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('continue-button')).toBeInTheDocument();
  });

  it('navigates back to the previous step when Back button is clicked', async () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding 
              onComplete={mockOnComplete}
              showNavigation={true}
            />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Navigate to second step using data-testid
    await act(async () => {
      userEvent.click(screen.getByTestId('next-button'));
    });

    // Verify we're on the second step with waitFor to handle async transitions
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /discover personalized content/i });
      expect(heading).toBeInTheDocument();
    });

    // Navigate back to first step using data-testid
    await act(async () => {
      userEvent.click(screen.getByTestId('back-button'));
    });

    // Should be back on the first step - using waitFor for async transitions
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /welcome to nostr ads/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('calls onComplete when finishing the onboarding flow', async () => {
    // Mock the onComplete callback
    const mockCompleteCallback = jest.fn();
    
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding 
              onComplete={mockCompleteCallback}
              showNavigation={true} // Explicitly show navigation for test
            />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Make sure we're starting at the welcome step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome to nostr ads/i })).toBeInTheDocument();
    });

    // Navigate to second step (discovery) using data-testid
    await act(async () => {
      userEvent.click(screen.getByTestId('next-button'));
    });
    
    // Make sure we're on the discovery step by looking for expected elements
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /discover personalized content/i })).toBeInTheDocument();
    });
    
    // From discovery step, clicking continue button to move directly to privacy (notifications step removed)
    await act(async () => {
      userEvent.click(screen.getByTestId('continue-button'));
    });

    // Now we should be on privacy step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /privacy settings/i })).toBeInTheDocument();
    });

    // Click to go to feedback step
    await act(async () => {
      userEvent.click(screen.getByTestId('continue-button'));
    });

    // Now we should be on feedback step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /provide feedback/i })).toBeInTheDocument();
    });

    // Click to go to complete step
    await act(async () => {
      userEvent.click(screen.getByTestId('continue-button'));
    });

    // Make sure we're on the complete step by looking for the "You're All Set!" heading
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /you're all set/i })).toBeInTheDocument();
    });
    
    // Click Complete button on the final step using data-testid
    await act(async () => {
      const completeButton = screen.getByTestId('complete-button');
      userEvent.click(completeButton);
    });

    // Use waitFor to allow for any async state updates to complete
    await waitFor(() => {
      expect(mockCompleteCallback).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays informative content about being a viewer', () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding 
              onComplete={mockOnComplete}
              showNavigation={true}
            />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Should mention key viewer features
    expect(screen.getByText(/browse content/i)).toBeInTheDocument();
    expect(screen.getByText(/relevant ads/i)).toBeInTheDocument();
  });
  
  it('renders without navigation buttons when showNavigation is false', () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding 
              onComplete={mockOnComplete}
              showNavigation={false}
            />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Should still show content
    expect(screen.getByText(/welcome to nostr ads/i)).toBeInTheDocument();
    
    // Should NOT display navigation buttons
    expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
  });
});