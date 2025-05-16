import React from 'react';
import { render, screen } from '@testing-library/react';
import FormErrorDisplay from '@/components/errors/FormErrorDisplay';

describe('FormErrorDisplay', () => {
  it('renders nothing when no errors are provided', () => {
    const { container } = render(<FormErrorDisplay errors={null} />);
    expect(container.firstChild).toBeNull();
    
    const { container: emptyArrayContainer } = render(<FormErrorDisplay errors={[]} />);
    expect(emptyArrayContainer.firstChild).toBeNull();
  });
  
  it('renders a string error message correctly', () => {
    render(<FormErrorDisplay errors="Email is required" />);
    
    expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
  
  it('renders an Error object correctly', () => {
    const error = new Error('Invalid form submission');
    render(<FormErrorDisplay errors={error} />);
    
    expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument();
    expect(screen.getByText('Invalid form submission')).toBeInTheDocument();
  });
  
  it('renders a ValidationError with invalidFields correctly', () => {
    const validationError = new Error('Validation failed');
    (validationError as any).invalidFields = ['email', 'password', 'firstName'];
    
    render(<FormErrorDisplay errors={validationError} />);
    
    expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument();
    expect(screen.getByText(/Email is invalid/)).toBeInTheDocument();
    expect(screen.getByText(/Password is invalid/)).toBeInTheDocument();
    expect(screen.getByText(/First Name is invalid/)).toBeInTheDocument();
  });
  
  it('renders an array of field errors correctly', () => {
    const fieldErrors = [
      { field: 'email', message: 'Email must be a valid email address' },
      { field: 'password', message: 'Password must be at least 8 characters' }
    ];
    
    render(<FormErrorDisplay errors={fieldErrors} />);
    
    expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument();
    
    // Using more precise selectors to match the actual rendered structure
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Email must be a valid email address', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters', { exact: false })).toBeInTheDocument();
  });
  
  it('displays custom title when provided', () => {
    const customTitle = 'Please fix these errors';
    render(<FormErrorDisplay errors="Some error" title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });
  
  it('applies custom className when provided', () => {
    const { container } = render(
      <FormErrorDisplay 
        errors="Some error" 
        className="custom-class"
      />
    );
    
    const formErrorElement = container.firstChild;
    expect(formErrorElement).toHaveClass('custom-class');
  });
});