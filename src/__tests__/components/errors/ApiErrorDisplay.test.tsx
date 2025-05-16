import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApiErrorDisplay from '@/components/errors/ApiErrorDisplay';
import { formatUserErrorMessage } from '@/lib/errorService';

// Mock the formatUserErrorMessage function
jest.mock('@/lib/errorService', () => ({
  formatUserErrorMessage: jest.fn((error, defaultMessage) => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return defaultMessage;
  })
}));

describe('ApiErrorDisplay', () => {
  const mockError = new Error('Test API error');
  mockError.stack = 'Error: Test API error\n    at test.js:1:1';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders error message correctly', () => {
    render(<ApiErrorDisplay error={mockError} />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test API error')).toBeInTheDocument();
  });
  
  it('calls formatUserErrorMessage with error and default message', () => {
    render(<ApiErrorDisplay error={mockError} />);
    
    expect(formatUserErrorMessage).toHaveBeenCalledWith(
      mockError,
      'An error occurred while fetching data'
    );
  });
  
  it('uses custom message when provided', () => {
    const customMessage = 'Custom error message';
    render(<ApiErrorDisplay error={mockError} message={customMessage} />);
    
    expect(formatUserErrorMessage).toHaveBeenCalledWith(
      mockError,
      customMessage
    );
  });
  
  it('displays status code when available', () => {
    const errorWithStatus = { 
      message: 'API error', 
      status: 404
    };
    
    render(<ApiErrorDisplay error={errorWithStatus} />);
    
    expect(screen.getByText('Error (404)')).toBeInTheDocument();
  });
  
  it('shows retry button when onRetry prop is provided', () => {
    const handleRetry = jest.fn();
    render(<ApiErrorDisplay error={mockError} onRetry={handleRetry} />);
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
  
  it('does not show retry button when onRetry is not provided', () => {
    render(<ApiErrorDisplay error={mockError} />);
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });
  
  it('toggles technical details when details button is clicked', () => {
    render(<ApiErrorDisplay error={mockError} showDetails={true} />);
    
    // Initially, details should not be visible
    expect(screen.queryByText(/Error: Test API error/)).not.toBeInTheDocument();
    
    // Click to show details
    fireEvent.click(screen.getByText('Show technical details'));
    
    // Details should now be visible
    expect(screen.getByText(/Error: Test API error/)).toBeInTheDocument();
    expect(screen.getByText('Hide technical details')).toBeInTheDocument();
    
    // Click to hide details
    fireEvent.click(screen.getByText('Hide technical details'));
    
    // Details should be hidden again
    expect(screen.queryByText(/Error: Test API error/)).not.toBeInTheDocument();
    expect(screen.getByText('Show technical details')).toBeInTheDocument();
  });
  
  it('does not show technical details button when showDetails is false', () => {
    render(<ApiErrorDisplay error={mockError} showDetails={false} />);
    
    expect(screen.queryByText('Show technical details')).not.toBeInTheDocument();
  });
  
  it('applies custom className when provided', () => {
    const { container } = render(<ApiErrorDisplay error={mockError} className="custom-class" />);
    
    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass('custom-class');
  });
});