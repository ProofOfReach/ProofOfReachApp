import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NetworkErrorDisplay from '@/components/errors/NetworkErrorDisplay';

describe('NetworkErrorDisplay', () => {
  it('renders the default error message when no error is provided', () => {
    render(<NetworkErrorDisplay />);
    
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to the network')).toBeInTheDocument();
  });
  
  it('displays custom message when provided', () => {
    const customMessage = 'Custom network error message';
    render(<NetworkErrorDisplay message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
  
  it('displays the error message from an Error object', () => {
    const error = new Error('Connection refused');
    render(<NetworkErrorDisplay error={error} />);
    
    expect(screen.getByText('Connection refused')).toBeInTheDocument();
  });
  
  it('detects and displays specialized messages for common network errors', () => {
    // Timeout error
    const timeoutError = new Error('Request timed out after 30 seconds');
    const { rerender } = render(<NetworkErrorDisplay error={timeoutError} />);
    
    expect(screen.getByText(/Connection timed out/)).toBeInTheDocument();
    
    // Network offline error
    const offlineError = new Error('Network offline');
    rerender(<NetworkErrorDisplay error={offlineError} />);
    
    expect(screen.getByText(/Network connection lost/)).toBeInTheDocument();
    
    // Aborted error
    const abortedError = new Error('Request aborted');
    rerender(<NetworkErrorDisplay error={abortedError} />);
    
    expect(screen.getByText(/The connection was interrupted/)).toBeInTheDocument();
  });
  
  it('shows help tips when showHelpTips is true', () => {
    render(<NetworkErrorDisplay showHelpTips={true} />);
    
    expect(screen.getByText('Try the following:')).toBeInTheDocument();
    expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
  });
  
  it('hides help tips when showHelpTips is false', () => {
    render(<NetworkErrorDisplay showHelpTips={false} />);
    
    expect(screen.queryByText('Try the following:')).not.toBeInTheDocument();
  });
  
  it('renders retry button when onRetry is provided', () => {
    const handleRetry = jest.fn();
    render(<NetworkErrorDisplay onRetry={handleRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
  
  it('does not render retry button when onRetry is not provided', () => {
    render(<NetworkErrorDisplay />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
  
  it('applies custom className when provided', () => {
    const { container } = render(<NetworkErrorDisplay className="custom-class" />);
    
    const errorElement = container.firstChild;
    expect(errorElement).toHaveClass('custom-class');
  });
});