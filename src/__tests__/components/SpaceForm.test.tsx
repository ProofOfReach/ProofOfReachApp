import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpaceForm from '../../components/SpaceForm';

describe('SpaceForm Component', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders with empty initial data', () => {
    render(<SpaceForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Verify form fields exist
    expect(screen.getByLabelText(/ad space name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();
    
    // Check for default values
    expect(screen.getByLabelText(/min bid per impression/i)).toHaveValue(5);
    expect(screen.getByLabelText(/min bid per click/i)).toHaveValue(50);
    
    // Medium Rectangle should be selected by default
    const sizeSelect = screen.getByLabelText(/ad size/i);
    expect(sizeSelect).toHaveValue('300x250');
  });

  it('renders with provided initial data in edit mode', () => {
    const initialData = {
      name: 'Test Ad Space',
      description: 'This is a test ad space',
      website: 'https://example.com',
      minBidPerImpression: 10,
      minBidPerClick: 100,
      dimensions: '728x90',
      allowedAdTypes: 'image',
      contentCategory: 'technology',
      contentTags: 'test,example'
    };
    
    render(
      <SpaceForm 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
        initialData={initialData}
        editMode={true}
      />
    );
    
    // Check that initial data is populated
    expect(screen.getByLabelText(/ad space name/i)).toHaveValue('Test Ad Space');
    expect(screen.getByLabelText(/description/i)).toHaveValue('This is a test ad space');
    expect(screen.getByLabelText(/website url/i)).toHaveValue('https://example.com');
    expect(screen.getByLabelText(/min bid per impression/i)).toHaveValue(10);
    expect(screen.getByLabelText(/min bid per click/i)).toHaveValue(100);
    
    // Leaderboard should be selected
    const sizeSelect = screen.getByLabelText(/ad size/i);
    expect(sizeSelect).toHaveValue('728x90');
    
    // Technology category should be selected
    const categorySelect = screen.getByLabelText(/content category/i);
    expect(categorySelect).toHaveValue('technology');
  });

  it('validates required fields', () => {
    render(<SpaceForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Clear required fields
    const nameInput = screen.getByLabelText(/ad space name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: '' } });
    
    const websiteInput = screen.getByLabelText(/website url/i);
    fireEvent.change(websiteInput, { target: { value: '' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create ad space/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/website is required/i)).toBeInTheDocument();
    
    // onSubmit should not have been called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates website URL format', () => {
    render(<SpaceForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Enter invalid website URL
    const websiteInput = screen.getByLabelText(/website url/i);
    fireEvent.change(websiteInput, { target: { value: 'invalid-url' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create ad space/i });
    fireEvent.click(submitButton);
    
    // Check for URL validation error
    expect(screen.getByText(/please enter a valid website url/i)).toBeInTheDocument();
    
    // onSubmit should not have been called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles custom size selection', () => {
    render(<SpaceForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Select custom size
    const sizeSelect = screen.getByLabelText(/ad size/i);
    fireEvent.change(sizeSelect, { target: { value: 'custom' } });
    
    // Custom size input should appear
    const customSizeInput = screen.getByLabelText(/custom dimensions/i);
    expect(customSizeInput).toBeInTheDocument();
    
    // Enter custom dimensions
    fireEvent.change(customSizeInput, { target: { value: '400x200' } });
    
    // Fill in other required fields
    const nameInput = screen.getByLabelText(/ad space name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Ad Space' } });
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    
    const websiteInput = screen.getByLabelText(/website url/i);
    fireEvent.change(websiteInput, { target: { value: 'https://example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create ad space/i });
    fireEvent.click(submitButton);
    
    // onSubmit should be called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Ad Space',
      description: 'Test description',
      website: 'https://example.com',
      dimensions: '400x200'
    }));
  });

  it('shows loading state when isSubmitting is true', () => {
    render(<SpaceForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    
    // Check that the submit button is disabled and shows loading state
    const submitButton = screen.getByRole('button', { name: /processing/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/processing/i);
  });

  it('submits form with valid data', () => {
    render(<SpaceForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Fill in required fields
    const nameInput = screen.getByLabelText(/ad space name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Ad Space' } });
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    
    const websiteInput = screen.getByLabelText(/website url/i);
    fireEvent.change(websiteInput, { target: { value: 'https://example.com' } });
    
    // Change minimum bids
    const impressionBidInput = screen.getByLabelText(/min bid per impression/i);
    fireEvent.change(impressionBidInput, { target: { value: '8' } });
    
    const clickBidInput = screen.getByLabelText(/min bid per click/i);
    fireEvent.change(clickBidInput, { target: { value: '80' } });
    
    // Select a different category
    const categorySelect = screen.getByLabelText(/content category/i);
    fireEvent.change(categorySelect, { target: { value: 'finance' } });
    
    // Add content tags
    const tagsInput = screen.getByLabelText(/content tags/i);
    fireEvent.change(tagsInput, { target: { value: 'finance,money,crypto' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create ad space/i });
    fireEvent.click(submitButton);
    
    // onSubmit should be called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Ad Space',
      description: 'Test description',
      website: 'https://example.com',
      dimensions: '300x250',
      minBidPerImpression: 8,
      minBidPerClick: 80,
      contentCategory: 'finance',
      contentTags: 'finance,money,crypto'
    }));
  });
});