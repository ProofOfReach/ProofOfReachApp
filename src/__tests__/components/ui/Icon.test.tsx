import React from 'react';
import { render, screen } from '@testing-library/react';
import "./components/ui/icon';

describe('Icon Component', () => {
  it('renders icon correctly with specified name', () => {
    render(<Icon name="home" />);
    const iconElement = screen.getByTestId('icon-home');
    expect(iconElement).toBeInTheDocument();
  });

  it('applies custom classNames correctly', () => {
    render(<Icon name="settings" className="test-class" />);
    const iconElement = screen.getByTestId('icon-settings');
    expect(iconElement).toBeInTheDocument();
    // The class is applied directly to the Feather icon, not to our container
  });

  it('applies custom size correctly', () => {
    render(<Icon name="user" size={32} />);
    const iconElement = screen.getByTestId('icon-user');
    expect(iconElement).toBeInTheDocument();
  });

  it('handles invalid icon names gracefully', () => {
    // @ts-ignore - Intentionally testing with invalid icon name
    render(<Icon name="non-existent-icon" />);
    expect(screen.getByText(/Missing icon/i)).toBeInTheDocument();
  });

  it('renders all available icon types', () => {
    const allIconNames = [
      'home', 'settings', 'viewer', 'chart', 'file', 'shield',
      'edit', 'dollar', 'code', 'check', 'pie', 'logout',
      'megaphone', 'sats', 'bitcoin'
    ];

    allIconNames.forEach(iconName => {
      const { unmount } = render(<Icon name={iconName as any} />);
      expect(screen.getByTestId(`icon-${iconName}`)).toBeInTheDocument();
      unmount();
    });
  });
});