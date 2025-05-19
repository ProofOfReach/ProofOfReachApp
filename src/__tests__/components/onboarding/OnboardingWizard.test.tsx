// Mock modules before imports
jest.mock('@/context/OnboardingContext', () => ({
  useOnboarding: jest.fn()
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Now import modules
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';

// Define types for the components
type OnboardingComponentProps = {
  onComplete: () => void;
};

type RoleConfirmationProps = {
  onConfirm: (role: string) => void;
};

// Mock the role-specific onboarding components
jest.mock('@/components/onboarding/ViewerOnboarding', () => ({
  __esModule: true,
  default: ({ onComplete }: OnboardingComponentProps) => (
    <div data-testid="viewer-onboarding">
      Viewer Onboarding
      <button data-testid="complete-viewer" onClick={onComplete}>Complete</button>
    </div>
  )
}));

jest.mock('@/components/onboarding/PublisherOnboarding', () => ({
  __esModule: true,
  default: ({ onComplete }: OnboardingComponentProps) => (
    <div data-testid="publisher-onboarding">
      Publisher Onboarding
      <button data-testid="complete-publisher" onClick={onComplete}>Complete</button>
    </div>
  )
}));

jest.mock('@/components/onboarding/AdvertiserOnboarding', () => ({
  __esModule: true,
  default: ({ onComplete }: OnboardingComponentProps) => (
    <div data-testid="advertiser-onboarding">
      Advertiser Onboarding
      <button data-testid="complete-advertiser" onClick={onComplete}>Complete</button>
    </div>
  )
}));

// Mock the role confirmation component
jest.mock('@/components/onboarding/RoleConfirmation', () => ({
  __esModule: true,
  default: ({ onConfirm }: RoleConfirmationProps) => (
    <div data-testid="role-confirmation">
      Role Confirmation
      <button data-testid="select-viewer" onClick={() => onConfirm('viewer')}>Select Viewer</button>
      <button data-testid="select-publisher" onClick={() => onConfirm('publisher')}>Select Publisher</button>
      <button data-testid="select-advertiser" onClick={() => onConfirm('advertiser')}>Select Advertiser</button>
    </div>
  )
}));

// Mock the loading component
jest.mock('@/components/Loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>
}));

describe('OnboardingWizard', () => {
  // Default mock implementations
  const mockSetCurrentStep = jest.fn();
  const mockSetCurrentRole = jest.fn();
  const mockCompleteOnboarding = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useOnboarding implementation
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-selection',
      currentRole: '',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: false
    });
    
    // Mock useAuth implementation
    (useAuth as jest.Mock).mockReturnValue({
      auth: { pubkey: 'test-pubkey' },
      isAuthenticated: true,
      loading: false
    });
  });
  
  it('renders the role selection step initially', () => {
    render(<OnboardingWizard />);
    
    // Should display the role confirmation component
    expect(screen.getByTestId('role-confirmation')).toBeInTheDocument();
    
    // Should not display any of the role-specific onboarding components yet
    expect(screen.queryByTestId('viewer-onboarding')).not.toBeInTheDocument();
    expect(screen.queryByTestId('publisher-onboarding')).not.toBeInTheDocument();
    expect(screen.queryByTestId('advertiser-onboarding')).not.toBeInTheDocument();
  });
  
  it('displays a loading indicator when isLoading is true', () => {
    // Override the mock to simulate loading state
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-selection',
      currentRole: '',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: true,
      isComplete: false
    });
    
    render(<OnboardingWizard />);
    
    // Should display the loading component
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Should not display any onboarding components
    expect(screen.queryByTestId('role-confirmation')).not.toBeInTheDocument();
  });
  
  it('sets the current role and moves to role-specific step when a role is selected', async () => {
    render(<OnboardingWizard />);
    
    // Select the viewer role
    await act(async () => {
      fireEvent.click(screen.getByTestId('select-viewer'));
    });
    
    // Should set the current role
    expect(mockSetCurrentRole).toHaveBeenCalledWith('viewer');
    
    // Should move to the role-specific step
    expect(mockSetCurrentStep).toHaveBeenCalledWith('role-specific');
  });
  
  it('displays the viewer onboarding component for the viewer role', () => {
    // Mock the current step as role-specific and role as viewer
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
    
    // Should display the viewer onboarding component
    expect(screen.getByTestId('viewer-onboarding')).toBeInTheDocument();
    
    // Should not display the role selection or other role-specific components
    expect(screen.queryByTestId('role-confirmation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('publisher-onboarding')).not.toBeInTheDocument();
    expect(screen.queryByTestId('advertiser-onboarding')).not.toBeInTheDocument();
  });
  
  it('displays the publisher onboarding component for the publisher role', () => {
    // Mock the current step as role-specific and role as publisher
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      currentRole: 'publisher',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: false
    });
    
    render(<OnboardingWizard />);
    
    // Should display the publisher onboarding component
    expect(screen.getByTestId('publisher-onboarding')).toBeInTheDocument();
    
    // Should not display other components
    expect(screen.queryByTestId('role-confirmation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('viewer-onboarding')).not.toBeInTheDocument();
    expect(screen.queryByTestId('advertiser-onboarding')).not.toBeInTheDocument();
  });
  
  it('displays the advertiser onboarding component for the advertiser role', () => {
    // Mock the current step as role-specific and role as advertiser
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      currentRole: 'advertiser',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: false
    });
    
    render(<OnboardingWizard />);
    
    // Should display the advertiser onboarding component
    expect(screen.getByTestId('advertiser-onboarding')).toBeInTheDocument();
    
    // Should not display other components
    expect(screen.queryByTestId('role-confirmation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('viewer-onboarding')).not.toBeInTheDocument();
    expect(screen.queryByTestId('publisher-onboarding')).not.toBeInTheDocument();
  });
  
  it('calls completeOnboarding when a role-specific onboarding is completed', async () => {
    // Mock the current step as role-specific and role as viewer
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
    
    // Complete the viewer onboarding
    await act(async () => {
      fireEvent.click(screen.getByTestId('complete-viewer'));
    });
    
    // Should call completeOnboarding
    expect(mockCompleteOnboarding).toHaveBeenCalled();
  });
  
  it('fallbacks to role selection if current role is invalid', () => {
    // Mock the current step as role-specific but with an invalid role
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
    
    // Should fallback to role selection
    expect(mockSetCurrentStep).toHaveBeenCalledWith('role-selection');
  });
  
  it('handles completed onboarding state', () => {
    // Mock onboarding as complete
    (useOnboarding as jest.Mock).mockReturnValue({
      currentStep: 'role-specific',
      currentRole: 'viewer',
      setCurrentStep: mockSetCurrentStep,
      setCurrentRole: mockSetCurrentRole,
      completeOnboarding: mockCompleteOnboarding,
      isLoading: false,
      isComplete: true
    });
    
    const { container } = render(<OnboardingWizard />);
    
    // Should render empty div when onboarding is complete
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});