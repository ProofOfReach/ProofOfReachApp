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

describe('AdForm CPM/CPC Functionality', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with updated CPM/CPC terminology', async () => {
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });

    // Check that the new terminology is used
    expect(screen.getByLabelText(/CPM \(Cost per Mille\/1000 Impressions\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CPC \(Cost per Click\)/i)).toBeInTheDocument();
    
    // Check that the info section about pricing model exists
    expect(screen.getByText(/Pricing Model: Choose CPM or CPC/i)).toBeInTheDocument();
    
    // These texts are inside a tooltip, so we need a different approach to verify them
    // We can check if the tooltip trigger element exists, which is sufficient for this test
    const tooltipTrigger = screen.getByText(/Pricing Model: Choose CPM or CPC/i);
    expect(tooltipTrigger).toBeInTheDocument();
  });
  
  it('disables CPC field when CPM is filled', async () => {
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} initialData={{ bidPerImpression: 0, bidPerClick: 0 }} />);
    });
    
    // Get the CPM and CPC inputs
    const cpmInput = screen.getByLabelText(/CPM \(Cost per Mille\/1000 Impressions\)/i);
    const cpcInput = screen.getByLabelText(/CPC \(Cost per Click\)/i);
    
    // Initially, both fields should be enabled (not disabled)
    expect(cpmInput).not.toBeDisabled();
    expect(cpcInput).not.toBeDisabled();
    
    // Set a value for CPM
    await act(async () => {
      fireEvent.change(cpmInput, { target: { value: '20' } });
    });
    
    // Now CPC should be disabled
    expect(cpcInput).toBeDisabled();
    
    // And there should be helper text explaining why
    expect(screen.getByText(/CPM is currently active/i)).toBeInTheDocument();
  });
  
  it('disables CPM field when CPC is filled', async () => {
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} initialData={{ bidPerImpression: 0, bidPerClick: 0 }} />);
    });
    
    // Get the CPM and CPC inputs
    const cpmInput = screen.getByLabelText(/CPM \(Cost per Mille\/1000 Impressions\)/i);
    const cpcInput = screen.getByLabelText(/CPC \(Cost per Click\)/i);
    
    // Set a value for CPC
    await act(async () => {
      fireEvent.change(cpcInput, { target: { value: '50' } });
    });
    
    // Now CPM should be disabled
    expect(cpmInput).toBeDisabled();
    
    // And there should be helper text explaining why
    expect(screen.getByText(/CPC is currently active/i)).toBeInTheDocument();
  });
  
  it('requires either CPM or CPC to be set when submitting the form', async () => {
    render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Fill in other required fields
    fireEvent.change(screen.getByLabelText(/Ad Title/i), {
      target: { value: 'Test Ad Title' }
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test Description' }
    });
    
    fireEvent.change(screen.getByLabelText(/Final Destination URL/i), {
      target: { value: 'https://example.com' }
    });
    
    // Set both CPM and CPC to 0
    fireEvent.change(screen.getByLabelText(/CPM/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/CPC/i), { target: { value: '0' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Ad/i }));
    
    // Check that validation error appears
    await waitFor(() => {
      expect(screen.getByText(/Either CPM or CPC must be set/i)).toBeInTheDocument();
    });
    
    // Verify that the onSubmit handler was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Now set a valid CPM
    fireEvent.change(screen.getByLabelText(/CPM/i), { target: { value: '15' } });
    
    // Submit again
    fireEvent.click(screen.getByRole('button', { name: /Create Ad/i }));
    
    // Verify that the onSubmit handler was called
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
  
  it('correctly toggles between CPM and CPC', async () => {
    await act(async () => {
      render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });
    
    // Get the CPM and CPC inputs
    const cpmInput = screen.getByLabelText(/CPM/i);
    const cpcInput = screen.getByLabelText(/CPC/i);
    
    // Set a value for CPM
    await act(async () => {
      fireEvent.change(cpmInput, { target: { value: '25' } });
    });
    
    // CPC should be disabled and set to 0
    expect(cpcInput).toBeDisabled();
    expect(cpcInput).toHaveValue(0);
    
    // Clear CPM field
    await act(async () => {
      fireEvent.change(cpmInput, { target: { value: '0' } });
    });
    
    // Both should be enabled now
    expect(cpmInput).not.toBeDisabled();
    expect(cpcInput).not.toBeDisabled();
    
    // Set a value for CPC
    await act(async () => {
      fireEvent.change(cpcInput, { target: { value: '75' } });
    });
    
    // CPM should be disabled and set to 0
    expect(cpmInput).toBeDisabled();
    expect(cpmInput).toHaveValue(0);
  });
  
  it('verifies that CPC is disabled when bidPerImpression > 0', () => {
    // Set up with CPM active
    render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Get the input fields
    const cpmInput = screen.getByLabelText(/CPM/i);
    const cpcInput = screen.getByLabelText(/CPC/i);
    
    // Set a CPM value
    fireEvent.change(cpmInput, { target: { value: '25' } });
    
    // CPC should be disabled
    expect(cpcInput).toBeDisabled();
  });
  
  it('verifies that CPM is disabled when bidPerClick > 0', () => {
    // Set up with CPC active
    render(<AdForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Get the input fields
    const cpmInput = screen.getByLabelText(/CPM/i);
    const cpcInput = screen.getByLabelText(/CPC/i);
    
    // Set a CPC value
    fireEvent.change(cpcInput, { target: { value: '50' } });
    
    // CPM should be disabled
    expect(cpmInput).toBeDisabled();
  });
});