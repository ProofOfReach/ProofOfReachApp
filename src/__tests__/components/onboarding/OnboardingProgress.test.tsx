import React from 'react';
import { render, screen } from '@testing-library/react';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';

describe('OnboardingProgress', () => {
  it('should render the progress bar with correct percentage', () => {
    render(<OnboardingProgress currentStep={2} totalSteps={4} />);
    
    // Progress should be 50% (2/4)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('should display the current step and total steps', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={3} />);
    
    // Should show the step count (e.g., "Step 1 of 3")
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  it('should handle edge cases like first step', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={5} />);
    
    // Progress should be 20% (1/5)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '20');
  });

  it('should handle edge cases like last step', () => {
    render(<OnboardingProgress currentStep={5} totalSteps={5} />);
    
    // Progress should be 100% (5/5)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('should handle 0 total steps edge case', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={0} />);
    
    // Progress should be 0% if total steps is 0
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('should apply custom CSS classes when provided', () => {
    render(
      <OnboardingProgress 
        currentStep={2} 
        totalSteps={4} 
        className="custom-progress-container"
        barClassName="custom-progress-bar" 
      />
    );
    
    // Should apply custom class to container
    expect(screen.getByTestId('onboarding-progress')).toHaveClass('custom-progress-container');
    
    // Should apply custom class to progress bar
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('custom-progress-bar');
  });
});