/**
 * ErrorContext Unit Tests
 * 
 * Tests the functionality of the ErrorContext provider and associated hooks.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorProvider } from '@/context/ErrorContext';
import { useErrorState } from '@/hooks/useErrorState';
import '@/utils/toast';

// Mock console
jest.mock('@/lib/console', () => ({
  console: {
    error: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/utils/toast', () => ({
  toast: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
  },
}));

describe('ErrorContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useErrorState', () => {
    it('should return the error context when used within ErrorProvider', () => {
      const TestComponent = () => {
        const { hasError, message, setError, clearError } = useErrorState();
        
        return (
          <div>
            <div data-testid="error-message">{message}</div>
            <button 
              data-testid="set-error"
              onClick={() => setError({ 
                id: 'test-1',
                message: 'Test error', 
                type: 'api', 
                severity: 'error',
                source: 'test',
                timestamp: Date.now().toString(),
                category: 'EXTERNAL',
                active: true,
                userFacing: true
              })}
            >
              Set Error
            </button>
            <button 
              data-testid="clear-error"
              onClick={clearError}
            >
              Clear Error
            </button>
          </div>
        );
      };
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Initially no error
      expect(screen.getByTestId('error-message')).toHaveTextContent('');
      
      // Set error
      fireEvent.click(screen.getByTestId('set-error'));
      expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
      
      // Clear error
      fireEvent.click(screen.getByTestId('clear-error'));
      expect(screen.getByTestId('error-message')).toHaveTextContent('');
    });
  });
  
  describe('useErrorStateReporting', () => {
    it('should provide a simplified error reporting function', () => {
      const TestComponent = () => {
        const { logError } = useErrorState();
        
        return (
          <button 
            data-testid="report-error"
            onClick={() => logError(new Error('Test error'), 'test-component', 'network')}
          >
            Report Error
          </button>
        );
      };
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      fireEvent.click(screen.getByTestId('report-error'));
      
      // Error toast should be shown
      expect(console.log).toHaveBeenCalledWith('Error: Test error');
    });
  });
  
  describe('useErrorStateToast', () => {
    it('should provide simplified toast functions', () => {
      const TestComponent = () => {
        const { setError } = useErrorState();
        
        return (
          <div>
            <button 
              data-testid="info-toast"
              onClick={() => setError({ id: 'info', message: 'Info message', type: 'business', severity: 'info' })}
            >
              Info Toast
            </button>
            <button 
              data-testid="warn-toast"
              onClick={() => setError({ id: 'warn', message: 'Warning message', type: 'validation', severity: 'warn' })}
            >
              Warning Toast
            </button>
            <button 
              data-testid="error-toast"
              onClick={() => setError({ id: 'error', message: 'Error message', type: 'technical', severity: 'error' })}
            >
              Error Toast
            </button>
            <button 
              data-testid="critical-toast"
              onClick={() => setError({ id: 'critical', message: 'Critical message', type: 'network', severity: 'critical' })}
            >
              Critical Toast
            </button>
            <button 
              data-testid="log-toast"
              onClick={() => setError({ id: 'success', message: 'Success message', type: 'business', severity: 'info' })}
            >
              Success Toast
            </button>
          </div>
        );
      };
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Test different types of toasts
      fireEvent.click(screen.getByTestId('info-toast'));
      expect(console.info).toHaveBeenCalledWith('Info message');
      
      fireEvent.click(screen.getByTestId('warn-toast'));
      expect(console.warn).toHaveBeenCalledWith('Warning message');
      
      fireEvent.click(screen.getByTestId('error-toast'));
      expect(console.log).toHaveBeenCalledWith('Error message');
      
      fireEvent.click(screen.getByTestId('critical-toast'));
      expect(console.log).toHaveBeenCalledWith('Critical message');
      
      fireEvent.click(screen.getByTestId('log-toast'));
      expect(console.log).toHaveBeenCalledWith('Success message');
    });
  });
});