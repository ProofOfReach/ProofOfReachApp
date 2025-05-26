import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestModeBanner } from '../../components/TestModeBanner';
import { useTestMode } from '../../hooks/useTestMode';

// Mock the useTestMode hook
jest.mock('../../hooks/useTestMode');
const mockUseTestMode = useTestMode as jest.MockedFunction<typeof useTestMode>;

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('TestModeBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock return value
    mockUseTestMode.mockReturnValue({
      isActive: true,
      timeRemaining: 3600,
      disableTestMode: jest.fn(),
      enableTestMode: jest.fn(),
      enableAllRoles: jest.fn(),
      setCurrentRole: jest.fn(),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
  });

  it('renders the banner when in test mode', () => {
    render(<TestModeBanner />);
    
    expect(screen.getByText('TEST MODE ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Exit Test Mode')).toBeInTheDocument();
  });

  it('does not render when not in test mode', () => {
    mockUseTestMode.mockReturnValue({
      isActive: false,
      timeRemaining: null,
      disableTestMode: jest.fn(),
      enableTestMode: jest.fn(),
      enableAllRoles: jest.fn(),
      setCurrentRole: jest.fn(),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });
    
    const { container } = render(<TestModeBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls disableTestMode when exit button is clicked', () => {
    const mockDisableTestMode = jest.fn();
    mockUseTestMode.mockReturnValue({
      isActive: true,
      timeRemaining: 3600,
      disableTestMode: mockDisableTestMode,
      enableTestMode: jest.fn(),
      enableAllRoles: jest.fn(),
      setCurrentRole: jest.fn(),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });

    render(<TestModeBanner />);
    
    const exitButton = screen.getByText('Exit Test Mode');
    fireEvent.click(exitButton);
    
    expect(mockDisableTestMode).toHaveBeenCalled();
  });

  it('displays time remaining correctly', () => {
    mockUseTestMode.mockReturnValue({
      isActive: true,
      timeRemaining: 1800, // 30 minutes
      disableTestMode: jest.fn(),
      enableTestMode: jest.fn(),
      enableAllRoles: jest.fn(),
      setCurrentRole: jest.fn(),
      isTestModeAllowed: true,
      isDevEnvironment: true,
      currentRole: 'admin',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      createTimeLimitedSession: jest.fn(),
      createTestScenario: jest.fn(),
      setDebugMode: jest.fn()
    });

    render(<TestModeBanner />);
    
    expect(screen.getByText(/30:00/)).toBeInTheDocument();
  });
});