/**
 * useErrorState Hook Unit Tests
 * 
 * Tests the functionality of the useErrorState hook for accessing global error state.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useErrorState } from '@/hooks/useErrorState';
import * as errorIntegration from '@/lib/errorIntegration';

// Mock errorIntegration
jest.mock('@/lib/errorIntegration', () => ({
  getErrorState: jest.fn(),
  updateErrorState: jest.fn(),
  resetErrorTracking: jest.fn(),
  reportError: jest.fn(),
}));

describe('useErrorState', () => {
  const mockErrorState = {
    hasError: false,
    message: '',
    type: 'unknown',
    severity: 'info',
    timestamp: null,
    code: null,
    details: null,
    source: null,
  };
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (errorIntegration.getErrorState as jest.Mock).mockReturnValue(mockErrorState);
  });
  
  it('should initialize with error state from errorIntegration', () => {
    (errorIntegration.getErrorState as jest.Mock).mockReturnValue({
      ...mockErrorState,
      hasError: true,
      message: 'Initial error',
      type: 'api',
      severity: 'error',
    });
    
    const TestComponent = () => {
      const errorState = useErrorState();
      
      return (
        <div>
          <div data-testid="has-error">{errorState.hasError.toString()}</div>
          <div data-testid="message">{errorState.message}</div>
          <div data-testid="type">{errorState.type}</div>
          <div data-testid="severity">{errorState.severity}</div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent('Initial error');
    expect(screen.getByTestId('type')).toHaveTextContent('api');
    expect(screen.getByTestId('severity')).toHaveTextContent('error');
  });
  
  it('should provide a setError function that updates error state', () => {
    const TestComponent = () => {
      const { setError, hasError, message } = useErrorState();
      
      return (
        <div>
          <div data-testid="has-error">{hasError.toString()}</div>
          <div data-testid="message">{message}</div>
          <button 
            data-testid="set-error"
            onClick={() => setError({ message: 'New error', type: 'network', severity: 'warning' })}
          >
            Set Error
          </button>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Simulate the state update that would happen when updateErrorState is called
    (errorIntegration.getErrorState as jest.Mock).mockReturnValue({
      ...mockErrorState,
      hasError: true,
      message: 'New error',
      type: 'network',
      severity: 'warning',
    });
    
    fireEvent.click(screen.getByTestId('set-error'));
    
    // Verify updateErrorState was called with the right params
    expect(errorIntegration.trackError).toHaveBeenCalledWith({ 
      message: 'New error', 
      type: 'network', 
      severity: 'warning' 
    });
  });
  
  it('should provide a clearError function that resets error state', () => {
    // Initial state with an error
    (errorIntegration.getErrorState as jest.Mock).mockReturnValue({
      ...mockErrorState,
      hasError: true,
      message: 'Existing error',
    });
    
    const TestComponent = () => {
      const { clearError, hasError, message } = useErrorState();
      
      return (
        <div>
          <div data-testid="has-error">{hasError.toString()}</div>
          <div data-testid="message">{message}</div>
          <button 
            data-testid="clear-error"
            onClick={clearError}
          >
            Clear Error
          </button>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Before clearing
    expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent('Existing error');
    
    // Simulate the state reset that would happen when resetErrorTracking is called
    (errorIntegration.getErrorState as jest.Mock).mockReturnValue(mockErrorState);
    
    fireEvent.click(screen.getByTestId('clear-error'));
    
    // Verify resetErrorTracking was called
    expect(errorIntegration.resetErrorState).toHaveBeenCalled();
  });
  
  it('should provide a handleError function that reports errors', () => {
    const TestComponent = () => {
      const { handleError } = useErrorState();
      
      return (
        <button 
          data-testid="handle-error"
          onClick={() => handleError(new Error('Test error'), 'test-component', 'validation')}
        >
          Handle Error
        </button>
      );
    };
    
    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('handle-error'));
    
    // Verify reportError was called with the right params
    expect(errorIntegration.reportError).toHaveBeenCalledWith(
      expect.any(Error),
      'test-component',
      'validation',
      'error'
    );
  });
  
  // Test that component re-renders when error state changes
  it('should update when global error state changes', async () => {
    // Mock useState and useEffect
    const originalAddEventListener = window.addEventListener;
    const mockAddEventListener = jest.fn();
    window.addEventListener = mockAddEventListener;
    
    try {
      const TestComponent = () => {
        const { hasError, message } = useErrorState();
        
        return (
          <div>
            <div data-testid="has-error">{hasError.toString()}</div>
            <div data-testid="message">{message}</div>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      // Verify that it listens for error state changes
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'error-state-changed',
        expect.any(Function)
      );
      
      // Simulate the interval updating the state
      (errorIntegration.getErrorState as jest.Mock).mockReturnValue({
        ...mockErrorState,
        hasError: true,
        message: 'Updated via interval',
      });
      
      // Find the update function that was registered with setInterval
      const intervalCallback = jest.fn();
      jest.useFakeTimers();
      act(() => {
        jest.advanceTimersByTime(1000); // Advance past the interval
      });
      
    } finally {
      window.addEventListener = originalAddEventListener;
      jest.useRealTimers();
    }
  });
});