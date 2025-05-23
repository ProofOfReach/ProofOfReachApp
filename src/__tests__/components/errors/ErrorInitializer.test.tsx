/**
 * Tests for the ErrorInitializer component
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@/components/errors/ErrorInitializer';
import '@/lib/console';

// Mock the console module
jest.mock('@/lib/console', () => ({
  initializeErrorHandling: jest.fn()
}));

describe('ErrorInitializer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('initializes error handling on mount', () => {
    render(<ErrorInitializer />);
    
    // Should call initializeErrorHandling once
    expect(initializeErrorHandling).toHaveBeenCalledTimes(1);
  });
  
  it('does not initialize multiple times on re-render', () => {
    const { rerender } = render(<ErrorInitializer />);
    
    // Initial render should call initializeErrorHandling
    expect(initializeErrorHandling).toHaveBeenCalledTimes(1);
    
    // Re-render should not call initializeErrorHandling again
    rerender(<ErrorInitializer />);
    expect(initializeErrorHandling).toHaveBeenCalledTimes(1);
  });
  
  it('logs additional info in debug mode', () => {
    // Mock console.info
    const originalConsoleInfo = console.info;
    console.info = jest.fn();
    
    render(<ErrorInitializer debug={true} />);
    
    // Should call initializeErrorHandling
    expect(initializeErrorHandling).toHaveBeenCalledTimes(1);
    
    // Should log debug info
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Error handling system initialized')
    );
    
    // Restore console.info
    console.info = originalConsoleInfo;
  });
  
  it('renders nothing to the DOM', () => {
    const { container } = render(<ErrorInitializer />);
    
    // Component should not render anything
    expect(container.firstChild).toBeNull();
  });
});