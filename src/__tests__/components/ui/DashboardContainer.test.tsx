import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardContainer } from '../../../components/ui';

describe('DashboardContainer Component', () => {
  it('renders children correctly', () => {
    render(
      <DashboardContainer>
        <div data-testid="test-child">Test Content</div>
      </DashboardContainer>
    );
    
    expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    render(
      <DashboardContainer className="custom-class">
        <div>Content</div>
      </DashboardContainer>
    );
    
    const container = screen.getByTestId('dashboard-container');
    expect(container).toHaveClass('space-y-6');
    expect(container).toHaveClass('custom-class');
  });
});