import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { errorService } from '@/lib/errorService';
import { errorMonitoring } from '@/lib/errorMonitoring';

// Mock the errorService
jest.mock('@/lib/errorService', () => ({
  errorService: {
    isRecoverable: jest.fn().mockReturnValue(true),
    formatErrorForUser: jest.fn(error => error.message || 'Unknown error'),
    handleError: jest.fn()
  },
  reportErrorToService: jest.fn(),
  formatUserErrorMessage: jest.fn(error => error.message || 'Unknown error'),
  ErrorCategory: {
    OPERATIONAL: 'OPERATIONAL',
    PROGRAMMER: 'PROGRAMMER'
  },
  ErrorSeverity: {
    ERROR: 'ERROR',
    WARNING: 'WARNING'
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
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
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
    expect(screen.getByText('Test error')).toBeInTheDocument();
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
    const handleError = jest.fn();
    
    render(
      <ErrorBoundary onError={handleError}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith(
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
    
    fireEvent.click(screen.getByText('Reload Page'));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
  
  it('shows retry button for recoverable errors', () => {
    // Mock isRecoverable to return true
    (errorService.isRecoverable as jest.Mock).mockReturnValueOnce(true);
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });
  
  it('hides retry button for non-recoverable errors', () => {
    // Mock isRecoverable to return false
    (errorService.isRecoverable as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Reload Page')).not.toBeInTheDocument();
    expect(screen.getByText('This error cannot be automatically recovered.')).toBeInTheDocument();
  });
  
  it('shows technical details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ErrorThrowingComponent message="Technical error details" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Technical Details')).toBeInTheDocument();
  });
  
  it('hides technical details by default', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
  });
  
  it('passes the componentName to error reporting', () => {
    render(
      <ErrorBoundary componentName="TestComponent">
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Check that reportErrorToService was called with the correct component name
    expect(require('@/lib/errorService').reportErrorToService).toHaveBeenCalledWith(
      expect.any(Error),
      'TestComponent',
      expect.any(Object)
    );
  });
});