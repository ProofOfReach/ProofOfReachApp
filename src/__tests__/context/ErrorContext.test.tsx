/**
 * ErrorContext Unit Tests
 * 
 * Tests the functionality of the ErrorContext provider and associated hooks.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorProvider, useError, useErrorReporting, useErrorToast } from '@/context/ErrorContext';
import { toast } from '@/utils/toast';

// Mock errorService
jest.mock('@/lib/errorService', () => ({
  errorService: {
    reportError: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/utils/toast', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));

describe('ErrorContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useError', () => {
    it('should return the error context when used within ErrorProvider', () => {
      const TestComponent = () => {
        const { errorState, setError, clearError } = useError();
        
        return (
          <div>
            <div data-testid="error-message">{errorState.message}</div>
            <button 
              data-testid="set-error"
              onClick={() => setError({ message: 'Test error', type: 'api', severity: 'error' })}
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
  
  describe('useErrorReporting', () => {
    it('should provide a simplified error reporting function', () => {
      const TestComponent = () => {
        const { reportError } = useErrorReporting();
        
        return (
          <button 
            data-testid="report-error"
            onClick={() => reportError(new Error('Test error'), 'test-component', 'api')}
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
      expect(toast.error).toHaveBeenCalledWith('Error: Test error');
    });
  });
  
  describe('useErrorToast', () => {
    it('should provide simplified toast functions', () => {
      const TestComponent = () => {
        const { showErrorToast } = useErrorToast();
        
        return (
          <div>
            <button 
              data-testid="info-toast"
              onClick={() => showErrorToast('Info message', 'info')}
            >
              Info Toast
            </button>
            <button 
              data-testid="warning-toast"
              onClick={() => showErrorToast('Warning message', 'warning')}
            >
              Warning Toast
            </button>
            <button 
              data-testid="error-toast"
              onClick={() => showErrorToast('Error message', 'error')}
            >
              Error Toast
            </button>
            <button 
              data-testid="critical-toast"
              onClick={() => showErrorToast('Critical message', 'critical')}
            >
              Critical Toast
            </button>
            <button 
              data-testid="success-toast"
              onClick={() => showErrorToast('Success message', 'success')}
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
      expect(toast.info).toHaveBeenCalledWith('Info message');
      
      fireEvent.click(screen.getByTestId('warning-toast'));
      expect(toast.warning).toHaveBeenCalledWith('Warning message');
      
      fireEvent.click(screen.getByTestId('error-toast'));
      expect(toast.error).toHaveBeenCalledWith('Error message');
      
      fireEvent.click(screen.getByTestId('critical-toast'));
      expect(toast.error).toHaveBeenCalledWith('Critical message');
      
      fireEvent.click(screen.getByTestId('success-toast'));
      expect(toast.success).toHaveBeenCalledWith('Success message');
    });
  });
});