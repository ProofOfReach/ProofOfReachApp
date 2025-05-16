import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UrlParamsPreview from '../../components/UrlParamsPreview';

describe('UrlParamsPreview Component', () => {
  const mockBaseUrl = 'https://example.com/product';
  const mockParams = 'utm_source=nostr&utm_medium=ad&utm_campaign=test';

  it('renders with base URL and parameters', () => {
    render(
      <UrlParamsPreview 
        baseUrl={mockBaseUrl} 
        urlParams={mockParams} 
      />
    );
    
    // Check that the component renders the combined URL
    const expectedUrl = `${mockBaseUrl}?${mockParams}`;
    const urlElement = screen.getByText(expectedUrl);
    expect(urlElement).toBeInTheDocument();
    
    // Copy button should be visible
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders with just the base URL when no parameters are provided', () => {
    render(
      <UrlParamsPreview 
        baseUrl={mockBaseUrl} 
        urlParams="" 
      />
    );
    
    // Should show just the base URL
    const urlElement = screen.getByText(mockBaseUrl);
    expect(urlElement).toBeInTheDocument();
  });

  it('properly handles URL with existing query parameters', () => {
    const baseUrlWithQuery = 'https://example.com/product?id=123';
    const params = 'utm_source=nostr';
    
    render(
      <UrlParamsPreview 
        baseUrl={baseUrlWithQuery} 
        urlParams={params} 
      />
    );
    
    // Should append parameters with & instead of ?
    const expectedUrl = `${baseUrlWithQuery}&${params}`;
    const urlElement = screen.getByText(expectedUrl);
    expect(urlElement).toBeInTheDocument();
  });

  it('trims whitespace from parameters', () => {
    const params = '  utm_source=nostr&utm_medium=ad  ';
    
    render(
      <UrlParamsPreview 
        baseUrl={mockBaseUrl} 
        urlParams={params} 
      />
    );
    
    // Should show the URL with trimmed parameters
    const expectedUrl = `${mockBaseUrl}?utm_source=nostr&utm_medium=ad`;
    const urlElement = screen.getByText(expectedUrl);
    expect(urlElement).toBeInTheDocument();
  });

  it('handles empty base URL gracefully', () => {
    render(
      <UrlParamsPreview 
        baseUrl="" 
        urlParams={mockParams} 
      />
    );
    
    // Should show just the query string with a ? prefix
    const urlElement = screen.getByText(`?${mockParams}`);
    expect(urlElement).toBeInTheDocument();
  });

  it('calls clipboard API when copy button is clicked', () => {
    // Mock the clipboard API
    const mockWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    
    render(
      <UrlParamsPreview 
        baseUrl={mockBaseUrl} 
        urlParams={mockParams} 
      />
    );
    
    // Click the copy button
    fireEvent.click(screen.getByText('Copy'));
    
    // Clipboard API should be called with the full URL
    expect(mockWriteText).toHaveBeenCalledWith(`${mockBaseUrl}?${mockParams}`);
  });

  it('shows "Copied!" message after copying', () => {
    // Mock the clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    
    render(
      <UrlParamsPreview 
        baseUrl={mockBaseUrl} 
        urlParams={mockParams} 
      />
    );
    
    // Initially, should show "Copy"
    expect(screen.getByText('Copy')).toBeInTheDocument();
    
    // Click the copy button
    fireEvent.click(screen.getByText('Copy'));
    
    // Should now show "Copied!"
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('resets "Copied!" message after timeout', async () => {
    jest.useFakeTimers();
    
    // Mock the clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    
    render(
      <UrlParamsPreview 
        baseUrl={mockBaseUrl} 
        urlParams={mockParams} 
      />
    );
    
    // Click the copy button
    fireEvent.click(screen.getByText('Copy'));
    
    // "Copied!" message should be shown
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    
    // Advance timer to simulate timeout
    jest.advanceTimersByTime(2000);
    
    // Should revert back to "Copy"
    expect(screen.getByText('Copy')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('handles copy failure gracefully', () => {
    // Mock clipboard API to reject
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error('Copy failed')),
      },
    });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <UrlParamsPreview 
        baseUrl={mockBaseUrl} 
        urlParams={mockParams} 
      />
    );
    
    // Click the copy button
    fireEvent.click(screen.getByText('Copy'));
    
    // Should still show "Copied!" even if the actual copy failed
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});