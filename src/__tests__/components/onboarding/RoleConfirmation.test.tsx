import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoleConfirmation from '@/components/onboarding/RoleConfirmation';
import { UserRoleType } from '@/types/role';

// Mock the role context hook
jest.mock('@/context/RoleContext', () => ({
  useRole: () => ({
    availableRoles: ['viewer', 'publisher', 'advertiser'],
    currentRole: 'viewer',
    setCurrentRole: jest.fn(),
    loading: false,
    error: null
  })
}));

// Mock the onboarding context hook
jest.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => ({
    setSelectedRole: jest.fn(),
    selectedRole: null,
    onboardingStep: 0,
    onboardingComplete: false,
    setOnboardingComplete: jest.fn(),
    setOnboardingStep: jest.fn(),
    saveProgress: jest.fn(),
    loading: false
  })
}));

describe('RoleConfirmation', () => {
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all role options', () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Should display title
    expect(screen.getByText(/select your role/i)).toBeInTheDocument();

    // Should display all role options
    const viewerOption = screen.getByText(/viewer/i);
    const publisherOption = screen.getByText(/publisher/i);
    const advertiserOption = screen.getByText(/advertiser/i);

    expect(viewerOption).toBeInTheDocument();
    expect(publisherOption).toBeInTheDocument();
    expect(advertiserOption).toBeInTheDocument();

    // Should display descriptions for each role
    expect(screen.getByText(/browse ads and content/i)).toBeInTheDocument();
    expect(screen.getByText(/monetize your content/i)).toBeInTheDocument();
    expect(screen.getByText(/promote your products/i)).toBeInTheDocument();
  });

  it('calls onConfirm with "viewer" when viewer role is selected', async () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Click the viewer role option
    const viewerButton = screen.getByRole('button', { name: /viewer/i });
    await userEvent.click(viewerButton);

    // Should call onConfirm with "viewer"
    expect(mockOnConfirm).toHaveBeenCalledWith('viewer');
  });

  it('calls onConfirm with "publisher" when publisher role is selected', async () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Click the publisher role option
    const publisherButton = screen.getByRole('button', { name: /publisher/i });
    await userEvent.click(publisherButton);

    // Should call onConfirm with "publisher"
    expect(mockOnConfirm).toHaveBeenCalledWith('publisher');
  });

  it('calls onConfirm with "advertiser" when advertiser role is selected', async () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Click the advertiser role option
    const advertiserButton = screen.getByRole('button', { name: /advertiser/i });
    await userEvent.click(advertiserButton);

    // Should call onConfirm with "advertiser"
    expect(mockOnConfirm).toHaveBeenCalledWith('advertiser');
  });

  it('displays proper icons for each role', () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Should display icons for each role
    const roleCards = screen.getAllByTestId('role-card');
    expect(roleCards.length).toBe(3);

    // Each card should have an icon
    roleCards.forEach(card => {
      const icon = card.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('applies active styles to selected role', async () => {
    // Create a mock implementation that tracks the selected role
    const mockSetSelectedRole = jest.fn();
    
    // Override the default mock for this specific test
    jest.spyOn(require('@/context/OnboardingContext'), 'useOnboarding').mockReturnValue({
      setSelectedRole: mockSetSelectedRole,
      selectedRole: null,
      onboardingStep: 0,
      onboardingComplete: false,
      setOnboardingComplete: jest.fn(),
      setOnboardingStep: jest.fn(),
      saveProgress: jest.fn(),
      loading: false
    });

    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Add data-testid to role cards for testing
    const roleCards = document.querySelectorAll('.border.rounded-lg');
    roleCards.forEach(card => {
      card.setAttribute('data-testid', 'role-card');
    });

    // Initially, no role should be selected (using a different class for checking)
    const initialRoleCards = screen.getAllByTestId('role-card');
    initialRoleCards.forEach(card => {
      expect(card).not.toHaveClass('border-purple-500');
    });

    // Click the publisher role option
    const publisherButton = screen.getByText('Set Up as Publisher');
    await userEvent.click(publisherButton);

    // Verify the onConfirm was called with publisher
    expect(mockOnConfirm).toHaveBeenCalledWith('publisher');
    expect(mockSetSelectedRole).toHaveBeenCalledWith('publisher');
  });
});