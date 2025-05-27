import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardCard from '../../../components/ui/DashboardCard';

describe('DashboardCard Component', () => {
  it('renders children correctly', () => {
    render(
      <DashboardCard>
        <div data-testid="test-child">Test Content</div>
      </DashboardCard>
    );
    
    expect(screen.getByTestId('dashboard-card')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('renders title when provided', () => {
    render(
      <DashboardCard title="Test Title">
        <div>Content</div>
      </DashboardCard>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    render(
      <DashboardCard className="custom-class">
        <div>Content</div>
      </DashboardCard>
    );
    
    const card = screen.getByTestId('dashboard-card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('custom-class');
  });
  
  it('renders icon when provided', () => {
    const TestIcon = () => <div data-testid="test-icon">Icon</div>;
    
    render(
      <DashboardCard 
        title="Test Title" 
        icon={<TestIcon />}
      >
        <div>Content</div>
      </DashboardCard>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
  
  it('renders action when provided', () => {
    render(
      <DashboardCard 
        title="Test Title" 
        action={<button data-testid="test-button">Action</button>}
      >
        <div>Content</div>
      </DashboardCard>
    );
    
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });
});