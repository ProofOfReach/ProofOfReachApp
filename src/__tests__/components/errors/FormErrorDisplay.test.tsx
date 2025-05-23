import React from 'react';
import { render, screen } from '@testing-library/react';
import '@/components/errors/FormErrorDisplay';

describe('FormErrorDisplay', () => {
  it('renders nothing when no errors are provided', () => {
    const { container } = render(<FormErrorDisplay errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders array of error strings correctly', () => {
    const errors = ['Email is required', 'Password is too short'];
    
    render(<FormErrorDisplay errors={errors} />);
    
    expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
  });

  it('renders validation errors correctly', () => {
    render(<FormErrorDisplay errors={['Email is invalid', 'Password is required']} />);
    
    expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument();
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('renders single error string correctly', () => {
    const errorMessage = 'Invalid form submission';
    render(<FormErrorDisplay errors={[errorMessage]} />);
    
    expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument();
    expect(screen.getByText('Invalid form submission')).toBeInTheDocument();
  });
});