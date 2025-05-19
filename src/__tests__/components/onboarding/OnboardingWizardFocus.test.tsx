import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useOnboarding } from '@/context/OnboardingContext';

// Mock the context hook
jest.mock('@/context/OnboardingContext');

// Mock role-specific components
jest.mock('@/components/onboarding/RoleConfirmation', () => ({
  __esModule: true,
  default: () => <div data-testid="role-confirmation">Role Confirmation</div>
}));

jest.mock('@/components/onboarding/ViewerOnboarding', () => ({
  __esModule: true,
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="viewer-onboarding">
      Viewer Onboarding
      <button data-testid="viewer-complete" onClick={onComplete}>Complete Viewer Onboarding</button>
    </div>
  )
}));

jest.mock('@/components/onboarding/PublisherOnboarding', () => ({
  __esModule: true,
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="publisher-onboarding">
      Publisher Onboarding
      <button data-testid="publisher-complete" onClick={onComplete}>Complete Publisher Onboarding</button>
    </div>
  )
}));

describe('OnboardingWizard - Focused Tests', () => {
  // Mocks for context functions
  const mockSetCurrentStep = jest.fn();
  const mockSetCurrentRole = jest.fn();
  const mockCompleteOnboarding = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the complete button when isLastStep is true', async () => {
    // Mock as last step
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      currentRole: 'viewer',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: false,
      isLastStep: true
    });
    
    render(<OnboardingWizard />);
    
    // The "Complete Setup" button should be visible
    expect(screen.getByText('Complete Setup')).toBeInTheDocument();
    
    // Click the button
    await act(async () => {
      fireEvent.click(screen.getByText('Complete Setup'));
    });
    
    // Should have called completeOnboarding
    expect(mockCompleteOnboarding).toHaveBeenCalled();
  });

  it('should fall back to role selection when role is invalid', async () => {
    // Mock with invalid role
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      currentRole: 'invalid-role',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: false
    });
    
    render(<OnboardingWizard />);
    
    // With our useEffect hook, this should be called immediately
    expect(mockSetCurrentStep).toHaveBeenCalledWith('role-selection');
  });

  it('should call onComplete when role-specific component calls it', async () => {
    // Mock as viewer role
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      currentRole: 'viewer',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: false
    });
    
    render(<OnboardingWizard />);
    
    // Click the complete button in the ViewerOnboarding component
    await act(async () => {
      fireEvent.click(screen.getByTestId('viewer-complete'));
    });
    
    // Should have called completeOnboarding
    expect(mockCompleteOnboarding).toHaveBeenCalled();
  });
});