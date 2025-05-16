import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdForm from '../../components/AdForm';

// Mock fetch for API calls
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
) as jest.Mock;

describe('AdForm URL Parameters', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('allows entering URL parameters that will be appended to the target URL', async () => {
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });
    
    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Ad Title/i), {
        target: { value: 'Test Ad Title' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Advertiser Name/i), {
        target: { value: 'Test Advertiser' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: 'Test Description' }
      });
    });
    
    // Enter the base URL
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Final Destination URL/i), {
        target: { value: 'https://example.com' }
      });
    });
    
    // Enter URL parameters
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/URL Parameters/i), {
        target: { value: 'utm_source=nostr&utm_medium=ad&utm_campaign=test' }
      });
    });
    
    // Check budget fields have default values
    const budgetInput = screen.getByLabelText(/Total Budget/i);
    expect(budgetInput).toHaveValue(10000);
    
    // Submit the form
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Create Ad/i });
      fireEvent.click(submitButton);
    });
    
    // Verify that the onSubmit handler was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Ad Title',
          description: 'Test Description',
          finalDestinationUrl: 'https://example.com',
          urlParameters: 'utm_source=nostr&utm_medium=ad&utm_campaign=test'
        })
      );
    });
  });
  
  it('validates that URL parameters follow the correct format', async () => {
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });
    
    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Ad Title/i), {
        target: { value: 'Test Ad Title' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Advertiser Name/i), {
        target: { value: 'Test Advertiser' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: 'Test Description' }
      });
    });
    
    // Enter the base URL
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Final Destination URL/i), {
        target: { value: 'https://example.com' }
      });
    });
    
    // Enter invalid URL parameters
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/URL Parameters/i), {
        target: { value: 'this is not valid=parameters' }
      });
    });
    
    // Submit the form
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Create Ad/i });
      fireEvent.click(submitButton);
    });
    
    // Check that validation error appears
    await waitFor(() => {
      expect(screen.getByText(/Please enter valid URL parameters/i)).toBeInTheDocument();
    });
    
    // Verify that the onSubmit handler was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Fix the URL parameters
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/URL Parameters/i), {
        target: { value: 'utm_source=nostr&utm_campaign=test' }
      });
    });
    
    // Submit again
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Create Ad/i });
      fireEvent.click(submitButton);
    });
    
    // Verify that the onSubmit handler was called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          urlParameters: 'utm_source=nostr&utm_campaign=test'
        })
      );
    });
  });
  
  it('correctly handles empty URL parameters', async () => {
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });
    
    // Fill in required fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Ad Title/i), {
        target: { value: 'Test Ad Title' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Advertiser Name/i), {
        target: { value: 'Test Advertiser' }
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: 'Test Description' }
      });
    });
    
    // Enter the base URL
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Final Destination URL/i), {
        target: { value: 'https://example.com' }
      });
    });
    
    // Keep URL parameters empty
    
    // Submit the form
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Create Ad/i });
      fireEvent.click(submitButton);
    });
    
    // Verify that the onSubmit handler was called with empty URL parameters
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          finalDestinationUrl: 'https://example.com',
          urlParameters: ''
        })
      );
    });
  });
  
  it('initializes with provided URL parameters when in edit mode', async () => {
    const initialData = {
      advertiserName: 'Test Advertiser',
      title: 'Existing Ad',
      description: 'Existing Description',
      finalDestinationUrl: 'https://example.com',
      urlParameters: 'utm_source=nostr&utm_campaign=existing',
      budget: 20000,
      dailyBudget: 2000,
      bidPerImpression: 20,
      bidPerClick: 200
    };
    
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} initialData={initialData} editMode={true} isSubmitting={false} />);
    });
    
    // Check that fields are initialized with the provided values
    expect(screen.getByLabelText(/Ad Title/i)).toHaveValue('Existing Ad');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Existing Description');
    expect(screen.getByLabelText(/Final Destination URL/i)).toHaveValue('https://example.com');
    expect(screen.getByLabelText(/URL Parameters/i)).toHaveValue('utm_source=nostr&utm_campaign=existing');
    
    // Verify the submit button has the correct label for edit mode
    expect(screen.getByRole('button', { name: /Update Ad/i })).toBeInTheDocument();
  });
});