import React from 'react';
import { render, screen } from '@testing-library/react';
import.*./components/onboarding/OnboardingProgress';
import.*./context/OnboardingContext';

// Mock the OnboardingContext
jest.mock('@/context/OnboardingContext', () => {
  const actual = jest.requireActual('@/context/OnboardingContext');
  return {
    ...actual,
    useOnboarding: jest.fn().mockReturnValue({
      currentStep: 'role-selection',
      selectedRole: null,
      setCurrentStep: jest.fn(),
      setSelectedRole: jest.fn(),
      moveToNextStep: jest.fn(),
      resetOnboarding: jest.fn()
    })
  };
});

describe('OnboardingProgress', () => {
  it('should render the progress bar with custom values', () => {
    render(
      <OnboardingProvider>
        <OnboardingProgress 
          customCurrentStep={2} 
          customTotalSteps={4} 
          customProgress={50} 
        />
      </OnboardingProvider>
    );
    
    // Progress should be 50%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    
    // Check the transform style instead of aria-valuenow
    const progressIndicator = progressBar.querySelector('div');
    expect(progressIndicator).toHaveStyle('transform: translateX(-50%)');
    
    // Should display the step count
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
  });

  it('should display the current step and total steps', () => {
    render(
      <OnboardingProvider>
        <OnboardingProgress 
          customCurrentStep={1} 
          customTotalSteps={3} 
        />
      </OnboardingProvider>
    );
    
    // Should show the step count (e.g., "Step 1 of 3")
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  it('should handle edge cases like first step', () => {
    render(
      <OnboardingProvider>
        <OnboardingProgress 
          customCurrentStep={1} 
          customTotalSteps={5} 
          customProgress={0} 
        />
      </OnboardingProvider>
    );
    
    // Progress should be 0% (1/5 with customProgress override)
    const progressBar = screen.getByRole('progressbar');
    const progressIndicator = progressBar.querySelector('div');
    expect(progressIndicator).toHaveStyle('transform: translateX(-100%)');
  });

  it('should handle edge cases like last step', () => {
    render(
      <OnboardingProvider>
        <OnboardingProgress 
          customCurrentStep={5} 
          customTotalSteps={5} 
          customProgress={100} 
        />
      </OnboardingProvider>
    );
    
    // Progress should be 100% (5/5)
    const progressBar = screen.getByRole('progressbar');
    const progressIndicator = progressBar.querySelector('div');
    expect(progressIndicator).toHaveStyle('transform: translateX(-0%)');
  });

  it('should handle single step edge case', () => {
    render(
      <OnboardingProvider>
        <OnboardingProgress 
          customCurrentStep={1} 
          customTotalSteps={1} 
        />
      </OnboardingProvider>
    );
    
    // Progress should be 100% for single step
    const progressBar = screen.getByRole('progressbar');
    const progressIndicator = progressBar.querySelector('div');
    expect(progressIndicator).toHaveStyle('transform: translateX(-0%)');
  });

  it('should apply custom CSS classes when provided', () => {
    render(
      <OnboardingProvider>
        <OnboardingProgress 
          customCurrentStep={2} 
          customTotalSteps={4} 
          className="custom-progress-container"
        />
      </OnboardingProvider>
    );
    
    // Should apply custom class to container
    expect(screen.getByTestId('onboarding-progress')).toHaveClass('custom-progress-container');
  });
});