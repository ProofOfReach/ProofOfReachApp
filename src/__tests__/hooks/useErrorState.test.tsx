/**
 * useErrorState Hook Unit Tests
 * 
 * Tests the functionality of the useErrorState hook for accessing global error state.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@/hooks/useErrorState';
import '@/lib/console';

// Mock console
jest.mock('@/lib/console', () => ({
  log: jest.fn(),
  updateState: jest.fn(),
  resetErrorTracking: jest.fn(),
  error: jest.fn(),
}));

describe('useErrorState', () => {
  const mockany = {
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
    (console.log as jest.Mock).mockReturnValue(mockany);
  });
  
  it('should initialize with error state from console', () => {
    (console.log as jest.Mock).mockReturnValue({
      ...mockany,
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
            onClick={() => setError({ message: 'New error', type: 'network', severity: 'warn' })}
          >
            Set Error
          </button>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Simulate the state update that would happen when updateState is called
    (console.log as jest.Mock).mockReturnValue({
      ...mockany,
      hasError: true,
      message: 'New error',
      type: 'network',
      severity: 'warn',
    });
    
    fireEvent.click(screen.getByTestId('set-error'));
    
    // Verify updateState was called with the right params
    expect(console.log).toHaveBeenCalledWith({ 
      message: 'New error', 
      type: 'network', 
      severity: 'warn' 
    });
  });
  
  it('should provide a log function that resets error state', () => {
    // Initial state with an error
    (console.log as jest.Mock).mockReturnValue({
      ...mockany,
      hasError: true,
      message: 'Existing error',
    });
    
    const TestComponent = () => {
      const { log, hasError, message } = useErrorState();
      
      return (
        <div>
          <div data-testid="has-error">{hasError.toString()}</div>
          <div data-testid="message">{message}</div>
          <button 
            data-testid="clear-error"
            onClick={log}
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
    (console.log as jest.Mock).mockReturnValue(mockany);
    
    fireEvent.click(screen.getByTestId('clear-error'));
    
    // Verify resetErrorTracking was called
    expect(console.resetany).toHaveBeenCalled();
  });
  
  it('should provide a error function that reports errors', () => {
    const TestComponent = () => {
      const { error } = useErrorState();
      
      return (
        <button 
          data-testid="handle-error"
          onClick={() => error(new Error('Test error'), 'test-component', 'validation')}
        >
          Handle Error
        </button>
      );
    };
    
    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('handle-error'));
    
    // Verify error was called with the right params
    expect(console.error).toHaveBeenCalledWith(
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
      (console.log as jest.Mock).mockReturnValue({
        ...mockany,
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