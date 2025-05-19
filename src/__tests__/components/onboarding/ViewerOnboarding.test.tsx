import React from 'react';
import { render, screen, act } from '@testing-library/react';
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
            <ViewerOnboarding onComplete={mockOnComplete} />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Should display the onboarding progress component
    expect(screen.getByTestId('onboarding-progress')).toBeInTheDocument();

    // Should display the welcome title
    expect(screen.getByText(/welcome to nostr ads/i)).toBeInTheDocument();

    // Should display navigation buttons
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('navigates to the next step when Next button is clicked', async () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding onComplete={mockOnComplete} />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Click the Next button
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /next/i }));
    });

    // Should now display the second step content
    expect(screen.getByText(/discover personalized content/i)).toBeInTheDocument();

    // Should have Back and Next buttons
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('navigates back to the previous step when Back button is clicked', async () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding onComplete={mockOnComplete} />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Navigate to second step
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /next/i }));
    });

    // Verify we're on the second step
    expect(screen.getByText(/discover personalized content/i)).toBeInTheDocument();

    // Navigate back to first step
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /back/i }));
    });

    // Should be back on the first step
    expect(screen.getByText(/welcome to nostr ads/i)).toBeInTheDocument();
  });

  it('calls onComplete when finishing the onboarding flow', async () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding onComplete={mockOnComplete} />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Navigate to second step
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /next/i }));
    });

    // Navigate to final step
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /next/i }));
    });

    // Click Complete button on the final step
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /complete/i }));
    });

    // Should call onComplete
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('displays informative content about being a viewer', () => {
    render(
      <AuthProvider>
        <RoleProvider>
          <OnboardingProvider>
            <ViewerOnboarding onComplete={mockOnComplete} />
          </OnboardingProvider>
        </RoleProvider>
      </AuthProvider>
    );

    // Should mention key viewer features
    expect(screen.getByText(/browse content/i)).toBeInTheDocument();
    expect(screen.getByText(/relevant ads/i)).toBeInTheDocument();
  });
});