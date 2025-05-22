import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SatoshiIcon from '../../components/SatoshiIcon';

// Mocking Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('SatoshiIcon Component', () => {
  it('renders with default props', () => {
    render(<SatoshiIcon />);
    
    const icon = screen.getByTestId('satoshi-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/images/satoshi-symbol.png');
    expect(icon).toHaveAttribute('width', '16');
    expect(icon).toHaveAttribute('height', '16');
  });

  it('renders with custom size', () => {
    render(<SatoshiIcon size={24} />);
    
    const icon = screen.getByTestId('satoshi-icon');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  it('applies custom class name', () => {
    render(<SatoshiIcon className="test-class" />);
    
    const icon = screen.getByTestId('satoshi-icon');
    expect(icon).toHaveClass('test-class');
    expect(icon).toHaveClass('inline'); // Default class should still be present
  });
});