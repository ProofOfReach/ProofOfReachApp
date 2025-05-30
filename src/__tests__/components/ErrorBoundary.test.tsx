import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

import '@/lib/errorMonitoring';

// Mock the console
jest.mock('@/lib/console', () => ({
  console: {
    // Static methods that don't belong on the service instance
    isRecoverable: jest.fn((error) => true),
    formatErrorForUser: jest.fn(error => error.message || 'Unknown error'),
    error: jest.fn(),
    
    // Core error methods
    logError: jest.fn().mockReturnValue({
      id: 'mock-error-id',
      active: true,
      message: 'Mock error message',
      type: 'unexpected',
      severity: 'error',
      timestamp: Date.now(),
      handled: false,
      recoverable: true,
      retryable: true,
      userFacing: true
    }),
    log: jest.fn().mockReturnValue(() => {}),
    addClearListener: jest.fn().mockReturnValue(() => {}),
    clearErrors: jest.fn()
  },
  // Legacy method for backward compatibility
  errorToService: jest.fn(),
  formatUserErrorMessage: jest.fn(error => error.message || 'Unknown error'),
  isRecoverableError: jest.fn().mockReturnValue(true),
  isRetryableError: jest.fn().mockReturnValue(true),
  errorTypes: {
    OPERATIONAL: 'OPERATIONAL',
    EXTERNAL: 'EXTERNAL',
    USER_INPUT: 'USER_INPUT',
    AUTHORIZATION: 'AUTHORIZATION',
    RESOURCE: 'RESOURCE',
    BUSINESS: 'BUSINESS'
  },
  severityLevels: {
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
    CRITICAL: 'CRITICAL',
    SUCCESS: 'SUCCESS'
  }
}));

// Mock errorMonitoring
jest.mock('@/lib/errorMonitoring', () => ({
  errorMonitoring: {
    captureError: jest.fn()
  }
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
  }
}));

// Helper component that throws an error
const ErrorThrowingComponent = ({ shouldThrow = true, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Suppress React error boundary console errors in test output
const originalConsoleError = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
  
  it('renders error UI when child throws an error', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/encountered an error/i)).toBeInTheDocument();
  });
  
  it('shows custom fallback UI when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
  
  it('calls onError handler when an error occurs', () => {
    const error = jest.fn();
    
    render(
      <ErrorBoundary onError={error}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
  
  it('calls onReset handler when retry button is clicked', () => {
    const handleReset = jest.fn();
    
    render(
      <ErrorBoundary onReset={handleReset}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
  
  it('shows retry button for errors', () => {
    // Our mock error returns a recoverable error by default
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
  
  it('passes the componentName to error reporting', () => {
    render(
      <ErrorBoundary componentName="TestComponent">
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Check that error was called with the correct component name
    expect(console.log).toHaveBeenCalledWith(
      expect.any(Error),
      'TestComponent',
      'unexpected',
      'error',
      expect.objectContaining({
        userFacing: true,
        recoverable: true,
        retryable: true
      })
    );
  });
});