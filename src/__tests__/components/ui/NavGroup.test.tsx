import React from 'react';
import { render, screen } from '@testing-library/react';
import '@/components/ui/nav-group';
import '@/lib/navigationBuilder';

// Mock the Icon component
jest.mock('@/components/ui/icon', () => {
  return function MockIcon({ name }: { name: IconName }) {
    return <span data-testid={`icon-${name}`}>Icon-{name}</span>;
  };
});

// Mock for Next.js Link/Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/test',
  }),
}));

describe('NavGroup Component', () => {
  const mockItems = [
    {
      label: 'Home',
      href: '/dashboard',
      iconName: 'home' as IconName,
      active: false
    },
    {
      label: 'Settings',
      href: '/settings',
      iconName: 'settings' as IconName,
      active: true
    }
  ];

  it('renders the group title correctly', () => {
    render(<NavGroup title="Test Group" items={mockItems} />);
    expect(screen.getByText('Test Group')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<NavGroup title="Test Group" items={mockItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies active class to active items', () => {
    const getActiveClass = (href: string, active?: boolean) => 
      active ? 'active-class' : '';
      
    render(
      <NavGroup 
        title="Test Group" 
        items={mockItems} 
        getActiveClass={getActiveClass} 
      />
    );
    
    // Check for active class on the active item
    const settingsLink = screen.getByTestId('nav-item-settings');
    expect(settingsLink).toHaveClass('active-class');
    
    // Check that inactive item doesn't have active class
    const homeLink = screen.getByTestId('nav-item-home');
    expect(homeLink).not.toHaveClass('active-class');
  });

  it('renders icons correctly', () => {
    render(<NavGroup title="Test Group" items={mockItems} />);
    expect(screen.getByTestId('icon-home')).toBeInTheDocument();
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
  });

  it('returns null when items array is empty', () => {
    const { container } = render(<NavGroup title="Empty Group" items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('works with direct icon prop instead of iconName', () => {
    const itemsWithIconProp = [
      {
        label: 'Custom Icon',
        href: '/custom',
        icon: <span data-testid="custom-icon">👍</span>,
        active: false
      }
    ];
    
    render(<NavGroup title="Custom Icons" items={itemsWithIconProp} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});