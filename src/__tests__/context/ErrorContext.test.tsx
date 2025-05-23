/**
 * ErrorContext Unit Tests
 * 
 * Tests the functionality of the ErrorContext provider and associated hooks.
 */

import React from 'react';
import { string } from '../../types/errors';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@/context/ErrorContext';
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
        const { errorState, setError, log } = useErrorState();
        
        return (
          <div>
            <div data-testid="error-message">{errorState.message}</div>
            <button 
              data-testid="set-error"
              onClick={() => setError({ 
                id: 'test-1',
                message: 'Test error', 
                type: 'api', 
                severity: 'error',
                source: 'test',
                timestamp: Date.now().toString(),
                category: string.EXTERNAL,
                active: true,
                userFacing: true
              })}
            >
              Set Error
            </button>
            <button 
              data-testid="clear-error"
              onClick={log}
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
        const { error } = useErrorStateReporting();
        
        return (
          <button 
            data-testid="report-error"
            onClick={() => error(new Error('Test error'), 'test-component', 'api')}
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
      expect(console.error).toHaveBeenCalledWith('Error: Test error');
    });
  });
  
  describe('useErrorStateToast', () => {
    it('should provide simplified toast functions', () => {
      const TestComponent = () => {
        const { showErrorToast } = useErrorStateToast();
        
        return (
          <div>
            <button 
              data-testid="info-toast"
              onClick={() => showErrorToast('Info message', 'info')}
            >
              Info Toast
            </button>
            <button 
              data-testid="warn-toast"
              onClick={() => showErrorToast('Warning message', 'warn')}
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
              data-testid="log-toast"
              onClick={() => showErrorToast('Success message', 'critical')}
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
      expect(console.error).toHaveBeenCalledWith('Error message');
      
      fireEvent.click(screen.getByTestId('critical-toast'));
      expect(console.error).toHaveBeenCalledWith('Critical message');
      
      fireEvent.click(screen.getByTestId('log-toast'));
      expect(console.log).toHaveBeenCalledWith('Success message');
    });
  });
});