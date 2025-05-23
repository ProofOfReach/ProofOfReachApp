import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import "./components/errors/ApiErrorDisplay';

describe('ApiErrorDisplay', () => {
  const mockError = new Error('Test error message');

  it('renders error message correctly', () => {
    render(<ApiErrorDisplay error={mockError} />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<ApiErrorDisplay error={mockError} title="Custom Error" />);
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('shows retry button when onRetry prop is provided', () => {
    const mockRetry = jest.fn();
    
    render(<ApiErrorDisplay error={mockError} onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalled();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ApiErrorDisplay error={mockError} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders nothing when no error is provided', () => {
    const { container } = render(<ApiErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });
});