import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '../../../components/ui';

describe('DashboardHeader Component', () => {
  it('renders title correctly', () => {
    render(<DashboardHeader title="Test Title" />);
    
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('renders description when provided', () => {
    render(
      <DashboardHeader 
        title="Test Title" 
        description="Test Description" 
      />
    );
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  it('renders icon when provided', () => {
    const TestIcon = () => <div data-testid="test-icon">Icon</div>;
    
    render(
      <DashboardHeader 
        title="Test Title" 
        icon={<TestIcon />}
      />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
  
  it('renders children when provided', () => {
    render(
      <DashboardHeader title="Test Title">
        <button data-testid="test-button">Action</button>
      </DashboardHeader>
    );
    
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});