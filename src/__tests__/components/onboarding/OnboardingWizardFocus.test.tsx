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
  // Include the currentStep parameter since the actual component expects it
  default: ({ onComplete, currentStep }: { onComplete: () => void, currentStep: string }) => (
    <div data-testid="viewer-onboarding">
      Viewer Onboarding - Step: {currentStep}
      <button data-testid="viewer-complete" onClick={onComplete}>Complete Viewer Onboarding</button>
    </div>
  )
}));

jest.mock('@/components/onboarding/PublisherOnboarding', () => ({
  __esModule: true,
  default: ({ onComplete, currentStep }: { onComplete: () => void, currentStep: string }) => (
    <div data-testid="publisher-onboarding">
      Publisher Onboarding - Step: {currentStep}
      <button data-testid="publisher-complete" onClick={onComplete}>Complete Publisher Onboarding</button>
    </div>
  )
}));

jest.mock('@/components/onboarding/AdvertiserOnboarding', () => ({
  __esModule: true,
  default: ({ onComplete, currentStep }: { onComplete: () => void, currentStep: string }) => (
    <div data-testid="advertiser-onboarding">
      Advertiser Onboarding - Step: {currentStep}
      <button data-testid="advertiser-complete" onClick={onComplete}>Complete Advertiser Onboarding</button>
    </div>
  )
}));

jest.mock('@/components/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>
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
    const mockSkipOnboarding = jest.fn();
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      selectedRole: 'invalid-role',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      skipOnboarding: mockSkipOnboarding,
      isLoading: false,
      isComplete: false
    });
    
    render(<OnboardingWizard />);
    
    // With our useEffect hook, skipOnboarding should be called immediately
    expect(mockSkipOnboarding).toHaveBeenCalled();
  });

  it('should call onComplete when role-specific component calls it', async () => {
    // Mock as viewer role with all required properties
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      currentRole: 'viewer',
      selectedRole: 'viewer', // This was missing
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      setSelectedRole: jest.fn(), // This was missing
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: false,
      goToNextStep: jest.fn(), // This was missing
      goToPreviousStep: jest.fn(), // This was missing
      isFirstStep: false, // This was missing
      isLastStep: true, // This was missing
      skipOnboarding: jest.fn() // This was missing
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