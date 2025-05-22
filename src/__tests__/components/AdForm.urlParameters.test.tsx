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
    // Increase timeout for this test specifically
    jest.setTimeout(10000);
    
    // Use a single act for initial render
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });
    
    // Batch all the form field changes in a single act
    await act(async () => {
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Ad Title/i), {
        target: { value: 'Test Ad Title' }
      });
      
      fireEvent.change(screen.getByLabelText(/Ad Description/i), {
        target: { value: 'Test Description' }
      });
      
      // Enter the base URL
      fireEvent.change(screen.getByLabelText(/Final Destination URL/i), {
        target: { value: 'https://example.com' }
      });
      
      // Also need to fill in Advertiser Name which is required
      fireEvent.change(screen.getByLabelText(/Advertiser Name/i), {
        target: { value: 'Test Advertiser' }
      });
      
      // Enter URL parameters
      fireEvent.change(screen.getByLabelText(/URL Parameters/i), {
        target: { value: 'utm_source=nostr&utm_medium=ad&utm_campaign=test' }
      });
    });
    
    // Check budget fields have default values
    const budgetInput = document.getElementById('budget') as HTMLInputElement;
    expect(parseInt(budgetInput.value)).toBe(10000);
    
    // Submit the form in another act
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Create Ad/i });
      fireEvent.click(submitButton);
    });
    
    // Verify that the onSubmit handler was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          advertiserName: 'Test Advertiser',
          title: 'Test Ad Title',
          description: 'Test Description',
          finalDestinationUrl: 'https://example.com',
          urlParameters: 'utm_source=nostr&utm_medium=ad&utm_campaign=test'
        })
      );
    }, { timeout: 5000 }); // Increased timeout for waitFor
  });
  
  it('validates that URL parameters follow the correct format', async () => {
    // Increase timeout for this test specifically
    jest.setTimeout(10000);
    
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });
    
    // Batch all the required field changes into a single act
    await act(async () => {
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Ad Title/i), {
        target: { value: 'Test Ad Title' }
      });
      
      fireEvent.change(screen.getByLabelText(/Ad Description/i), {
        target: { value: 'Test Description' }
      });
      
      // Also need to fill in Advertiser Name which is required
      fireEvent.change(screen.getByLabelText(/Advertiser Name/i), {
        target: { value: 'Test Advertiser' }
      });
      
      // Enter the base URL
      fireEvent.change(screen.getByLabelText(/Final Destination URL/i), {
        target: { value: 'https://example.com' }
      });
      
      // Enter invalid URL parameters - starting with ?
      fireEvent.change(screen.getByLabelText(/URL Parameters/i), {
        target: { value: '?utm_source=test' }
      });
    });
    
    // Submit the form in a single act
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /Create Ad/i });
      fireEvent.click(submitButton);
    });
    
    // Check that validation error appears
    await waitFor(() => {
      expect(screen.getByText(/Please enter parameters without the leading \? character/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify that the onSubmit handler was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Fix the URL parameters and submit again in a single act
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/URL Parameters/i), {
        target: { value: 'utm_source=nostr&utm_campaign=test' }
      });
      
      // Submit again
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
    }, { timeout: 5000 });
  });
  
  it('correctly handles empty URL parameters', async () => {
    // Increase timeout for this test specifically
    jest.setTimeout(10000);
    
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });
    
    // Batch all form field changes in a single act
    await act(async () => {
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Ad Title/i), {
        target: { value: 'Test Ad Title' }
      });
      
      fireEvent.change(screen.getByLabelText(/Ad Description/i), {
        target: { value: 'Test Description' }
      });
      
      // Also need to fill in Advertiser Name which is required
      fireEvent.change(screen.getByLabelText(/Advertiser Name/i), {
        target: { value: 'Test Advertiser' }
      });
      
      // Enter the base URL
      fireEvent.change(screen.getByLabelText(/Final Destination URL/i), {
        target: { value: 'https://example.com' }
      });
      
      // Keep URL parameters empty
    });
    
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
    }, { timeout: 5000 });
  });
  
  it('initializes with provided URL parameters when in edit mode', async () => {
    // Increase timeout for this test specifically
    jest.setTimeout(10000);
    
    const initialData = {
      advertiserName: 'Existing Advertiser',
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
    
    // Use waitFor with increased timeout to ensure all elements are found
    await waitFor(() => {
      // Check that fields are initialized with the provided values
      expect(screen.getByDisplayValue('Existing Ad')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('utm_source=nostr&utm_campaign=existing')).toBeInTheDocument();
      
      // Check that the update button is present
      expect(screen.getByRole('button', { name: 'Update Ad' })).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});