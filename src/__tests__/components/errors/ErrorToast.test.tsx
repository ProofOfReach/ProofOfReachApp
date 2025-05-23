import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import.*./components/errors/ErrorToast';
import.*./types/errors';

// Mock the setTimeout and clearTimeout functions
jest.useFakeTimers();

describe('ErrorToast', () => {
  it('renders the message correctly', () => {
    const message = 'An error occurred';
    render(<ErrorToast message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('applies correct styles based on error type', () => {
    // Error (default)
    const { rerender, container } = render(<ErrorToast message="Error message" type="error" />);
    expect(container.firstChild).toHaveClass('bg-red-100');
    expect(container.firstChild).toHaveClass('text-red-800');
    
    // Warning
    rerender(<ErrorToast message="Warning message" type="warning" />);
    expect(container.firstChild).toHaveClass('bg-amber-100');
    expect(container.firstChild).toHaveClass('text-amber-800');
    
    // Network
    rerender(<ErrorToast message="Network error" type="network" />);
    expect(container.firstChild).toHaveClass('bg-blue-100');
    expect(container.firstChild).toHaveClass('text-blue-800');
    
    // Permission
    rerender(<ErrorToast message="Permission error" type="permission" />);
    expect(container.firstChild).toHaveClass('bg-purple-100');
    expect(container.firstChild).toHaveClass('text-purple-800');
    
    // Validation
    rerender(<ErrorToast message="Validation error" type="validation" />);
    expect(container.firstChild).toHaveClass('bg-amber-100');
    expect(container.firstChild).toHaveClass('text-amber-800');
  });
  
  it('shows and calls retry action when provided', () => {
    const handleRetry = jest.fn();
    render(<ErrorToast message="Error message" retryAction={handleRetry} />);
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
  
  it('shows close button and calls onClose when clicked', () => {
    const handleClose = jest.fn();
    render(<ErrorToast message="Error message" onClose={handleClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('auto-closes after specified duration', () => {
    const handleClose = jest.fn();
    render(<ErrorToast message="Error message" duration={3000} onClose={handleClose} autoClose={true} />);
    
    // Fast-forward time by 2999ms
    act(() => {
      jest.advanceTimersByTime(2999);
    });
    expect(handleClose).not.toHaveBeenCalled();
    
    // Fast-forward the remaining 1ms
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not auto-close when autoClose is false', () => {
    const handleClose = jest.fn();
    render(<ErrorToast message="Error message" duration={3000} onClose={handleClose} autoClose={false} />);
    
    // Fast-forward time by 5000ms (longer than duration)
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(handleClose).not.toHaveBeenCalled();
  });
  
  it('includes error category as data attribute when provided', () => {
    const errorCategory = ErrorCategory.OPERATIONAL;
    const { container } = render(
      <ErrorToast 
        message="Error message" 
        errorCategory={errorCategory} 
      />
    );
    
    expect(container.firstChild).toHaveAttribute('data-error-category', errorCategory);
  });
});