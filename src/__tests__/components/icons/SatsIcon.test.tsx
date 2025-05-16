/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import SatsIcon from '../../../components/icons/SatsIcon';

// Mock the useCurrency hook
jest.mock('../../../context/CurrencyContext', () => ({
  useCurrency: () => ({
    currency: 'BTC',
    setCurrency: jest.fn(),
    toggleCurrency: jest.fn()
  })
}));

describe('SatsIcon Component', () => {
  it('renders with default props', () => {
    const { container } = render(<SatsIcon />);
    const svgElement = container.querySelector('svg');
    
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('viewBox', '0 0 16 16');
    expect(svgElement).toHaveAttribute('fill', 'currentColor');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<SatsIcon className="text-orange-500 w-8 h-8" />);
    const svgElement = container.querySelector('svg');
    
    expect(svgElement).toBeInTheDocument();
    expect(svgElement?.getAttribute('class')).toContain('text-orange-500');
    expect(svgElement?.getAttribute('class')).toContain('w-8');
    expect(svgElement?.getAttribute('class')).toContain('h-8');
  });

  it('renders the sats symbol path', () => {
    const { container } = render(<SatsIcon />);
    const pathElement = container.querySelector('path');
    
    expect(pathElement).toBeInTheDocument();
    // Verify the path contains data for rendering the sats symbol
    expect(pathElement).toHaveAttribute('d');
  });
});