import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/'
  })
}));

// Mock auth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    auth: { pubkey: 'test-pubkey' },
    isAuthenticated: true,
    loading: false
  })
}));

// Mock role hooks
jest.mock('@/context/RoleContext', () => ({
  useRole: () => ({
    currentRole: 'viewer',
    hasRole: jest.fn().mockReturnValue(true),
    availableRoles: ['viewer', 'publisher', 'advertiser'],
    loading: false
  }),
  useRoleContext: () => ({
    currentRole: 'viewer',
    hasRole: jest.fn().mockReturnValue(true),
    availableRoles: ['viewer', 'publisher', 'advertiser'],
    loading: false
  })
}));

// Mock onboarding service
jest.mock('@/lib/onboardingService', () => ({
  getOnboardingProgress: jest.fn().mockResolvedValue({
    role: 'viewer',
    completed: false,
    currentStep: 'role-selection',
    totalSteps: 3
  }),
  updateOnboardingProgress: jest.fn().mockResolvedValue(true),
  isOnboardingComplete: jest.fn().mockResolvedValue(false)
}));

// Test component that uses the useOnboarding hook
const TestComponent = () => {
  const { 
    currentStep, 
    setCurrentStep, 
    setCurrentRole, 
    isLoading, 
    isComplete
  } = useOnboarding();
  
  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="complete-state">{isComplete ? 'Complete' : 'Not Complete'}</div>
      <button 
        data-testid="set-step-button" 
        onClick={() => setCurrentStep('role-specific')}
      >
        Set Step
      </button>
      <button 
        data-testid="set-role-button" 
        onClick={() => setCurrentRole('publisher')}
      >
        Set Role
      </button>
    </div>
  );
};

describe('OnboardingContext', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    const mockRouter = {
      push: jest.fn(),
      pathname: '/'
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    const mockAuth = {
      auth: { pubkey: 'test-pubkey' },
      isAuthenticated: true,
      loading: false
    };
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue(mockAuth);
    
    const mockRole = {
      currentRole: 'viewer',
      hasRole: jest.fn().mockReturnValue(true),
      availableRoles: ['viewer', 'publisher', 'advertiser'],
      loading: false
    };
    jest.spyOn(RoleContext, 'useRole').mockReturnValue(mockRole);
    jest.spyOn(RoleContext, 'useRoleContext').mockReturnValue(mockRole);
    
    jest.spyOn(onboardingService, 'getOnboardingProgress').mockResolvedValue({
      role: 'viewer',
      completed: false,
      currentStep: 'role-selection',
      totalSteps: 3
    });
    
    jest.spyOn(onboardingService, 'updateOnboardingProgress').mockResolvedValue(true);
    jest.spyOn(onboardingService, 'isOnboardingComplete').mockResolvedValue(false);
  });

  it('provides the onboarding context to children', async () => {
    await act(async () => {
      render(
        <OnboardingProvider>
          <TestComponent />
        </OnboardingProvider>
      );
    });

    // Should initially show role-selection step
    expect(screen.getByTestId('current-step')).toHaveTextContent('role-selection');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('complete-state')).toHaveTextContent('Not Complete');
  });

  it('allows changing the current step', async () => {
    await act(async () => {
      render(
        <OnboardingProvider>
          <TestComponent />
        </OnboardingProvider>
      );
    });

    // Initial state
    expect(screen.getByTestId('current-step')).toHaveTextContent('role-selection');
    
    // Change step
    await act(async () => {
      screen.getByTestId('set-step-button').click();
    });
    
    // Should update the step
    expect(screen.getByTestId('current-step')).toHaveTextContent('role-specific');
    expect(onboardingService.updateOnboardingProgress).toHaveBeenCalled();
  });

  it('allows changing the current role', async () => {
    await act(async () => {
      render(
        <OnboardingProvider>
          <TestComponent />
        </OnboardingProvider>
      );
    });
    
    // Change role
    await act(async () => {
      screen.getByTestId('set-role-button').click();
    });
    
    // Should call the update function with the new role
    expect(onboardingService.updateOnboardingProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        pubkey: 'test-pubkey',
        role: 'publisher'
      })
    );
  });

  it('fetches onboarding progress on mount', async () => {
    await act(async () => {
      render(
        <OnboardingProvider>
          <TestComponent />
        </OnboardingProvider>
      );
    });
    
    // Should call getOnboardingProgress on mount
    expect(onboardingService.getOnboardingProgress).toHaveBeenCalledWith('test-pubkey', 'viewer');
  });

  it('handles loading state', async () => {
    // Initialize with loading state
    (onboardingService.getOnboardingProgress as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(null), 100))
    );
    
    let container: HTMLElement;
    
    await act(async () => {
      const rendered = render(
        <OnboardingProvider>
          <TestComponent />
        </OnboardingProvider>
      );
      container = rendered.container;
    });
    
    // Should show loading initially
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Finish loading
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    
    // Should no longer be loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
  });

  it('redirects to dashboard when onboarding is complete', async () => {
    // Mock onboarding as complete
    (onboardingService.isOnboardingComplete as jest.Mock).mockResolvedValue(true);
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/onboarding'
    });
    
    await act(async () => {
      render(
        <OnboardingProvider>
          <TestComponent />
        </OnboardingProvider>
      );
    });
    
    // Should redirect to dashboard
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('does not redirect when not on onboarding page', async () => {
    // Mock onboarding as complete
    (onboardingService.isOnboardingComplete as jest.Mock).mockResolvedValue(true);
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/some-other-page'
    });
    
    await act(async () => {
      render(
        <OnboardingProvider>
          <TestComponent />
        </OnboardingProvider>
      );
    });
    
    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
  });
});