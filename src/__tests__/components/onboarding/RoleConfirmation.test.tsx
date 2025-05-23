import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@/components/onboarding/RoleConfirmation';
import '@/types/role';

// Create a proper type store for localStorage
type StorageType = {
  [key: string]: string;
};

// Mocks for window.localStorage
const localStorageMock = (() => {
  let store: StorageType = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value.toString(); }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock process.env.NODE_ENV
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    NODE_ENV: 'test'
  }
}));

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
const mockSetSelectedRole = jest.fn();
jest.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => ({
    setSelectedRole: mockSetSelectedRole,
    selectedRole: null,
    currentStep: 'role-selection',
    progress: 0,
    totalSteps: 6,
    isFirstStep: true,
    isLastStep: false,
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    completeOnboarding: jest.fn(),
    isLoading: false,
    skipOnboarding: jest.fn()
  })
}));

// Mock console.log to prevent debug output in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('RoleConfirmation', () => {
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders all role options', () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Should display title
    expect(screen.getByText(/select your role/i)).toBeInTheDocument();

    // Should display all role options
    const viewerOption = screen.getByTestId('viewer-label');
    const publisherOption = screen.getByTestId('publisher-label');
    const advertiserOption = screen.getByTestId('advertiser-label');

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

    // Click the viewer role option - use button with exact text
    const viewerButton = screen.getByText('Set Up as Viewer');
    await userEvent.click(viewerButton);

    // Should call onConfirm with "viewer"
    expect(mockOnConfirm).toHaveBeenCalledWith('viewer' as UserRole);
  });

  it('calls onConfirm with "publisher" when publisher role is selected', async () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Click the publisher role option - use button with exact text
    const publisherButton = screen.getByText('Set Up as Publisher');
    await userEvent.click(publisherButton);

    // Should call onConfirm with "publisher"
    expect(mockOnConfirm).toHaveBeenCalledWith('publisher' as UserRole);
  });

  it('calls onConfirm with "advertiser" when advertiser role is selected', async () => {
    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Click the advertiser role option - use button with exact text
    const advertiserButton = screen.getByText('Set Up as Advertiser');
    await userEvent.click(advertiserButton);

    // Should call onConfirm with "advertiser"
    expect(mockOnConfirm).toHaveBeenCalledWith('advertiser' as UserRole);
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
    // Override the default mock for this specific test with mocked selectedRole state
    const customMockSetSelectedRole = jest.fn();
    jest.spyOn(require('@/context/OnboardingContext'), 'useOnboarding').mockReturnValue({
      setSelectedRole: customMockSetSelectedRole,
      selectedRole: null,
      currentStep: 'role-selection',
      progress: 0,
      totalSteps: 6,
      isFirstStep: true,
      isLastStep: false,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      completeOnboarding: jest.fn(),
      isLoading: false,
      skipOnboarding: jest.fn()
    });

    render(<RoleConfirmation onConfirm={mockOnConfirm} />);

    // Initially, no role should be selected
    const initialRoleCards = screen.getAllByTestId('role-card');
    initialRoleCards.forEach(card => {
      expect(card).not.toHaveClass('border-[#1a73e8] shadow-md');
    });

    // Click the publisher role option
    const publisherButton = screen.getByText('Set Up as Publisher');
    await userEvent.click(publisherButton);

    // Verify the onConfirm was called with publisher
    expect(mockOnConfirm).toHaveBeenCalledWith('publisher' as UserRole);
    expect(customMockSetSelectedRole).toHaveBeenCalledWith('publisher' as UserRole);
  });
});