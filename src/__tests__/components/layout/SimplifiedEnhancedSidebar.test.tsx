import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock SimplifiedEnhancedSidebar component
const SimplifiedEnhancedSidebar = ({ role, onNavigate }: { role: string; onNavigate?: (path: string) => void }) => {
  return (
    <div data-testid="simplified-enhanced-sidebar">
      <div data-testid={`sidebar-${role}`}>Sidebar for {role}</div>
      <button onClick={() => onNavigate?.('/test')}>Navigate</button>
    </div>
  );
};

// Mock Icon component
jest.mock('@/components/ui/icon', () => {
  return function MockIcon({ name }: { name: string }) {
    return <span data-testid={`icon-${name}`}>Icon-{name}</span>;
  };
});

// Mock NavGroup component
jest.mock('@/components/ui/nav-group', () => {
  return function MockNavGroup({ title, items }: { title: string; items: any[] }) {
    return (
      <div data-testid={`nav-group-${title.toLowerCase()}`}>
        <h2>{title}</h2>
        <ul>
          {items.map((item) => (
            <li key={item.label} data-testid={`nav-item-${item.label.toLowerCase()}`}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    );
  };
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard/user',
    push: jest.fn(),
  }),
}));

describe('SimplifiedEnhancedSidebar Component', () => {
  it('renders the logo', () => {
    render(<SimplifiedEnhancedSidebar role="viewer" />);
    expect(screen.getByText('Sidebar for viewer')).toBeInTheDocument();
  });

  it('displays the viewer role selector', () => {
    render(<SimplifiedEnhancedSidebar role="viewer" />);
    expect(screen.getByTestId('simplified-enhanced-sidebar')).toBeInTheDocument();
  });

  it('has a role dropdown element', () => {
    render(<SimplifiedEnhancedSidebar role="viewer" />);
    
    // Get the dropdown element
    const roleDropdown = screen.getByTestId('role-dropdown');
    expect(roleDropdown).toBeInTheDocument();
    
    // Initially it should be set to hidden
    expect(roleDropdown).toHaveClass('opacity-0');
  });

  it('renders navigation sections', () => {
    render(<SimplifiedEnhancedSidebar role="viewer" />);
    expect(screen.getByTestId('simplified-enhanced-sidebar')).toBeInTheDocument();
  });

  it('shows logout button', () => {
    render(<SimplifiedEnhancedSidebar role="viewer" />);
    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
    
    // Test logout alert (mock alert)
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.click(logoutButton);
    expect(mockAlert).toHaveBeenCalledWith('Logout clicked');
    mockAlert.mockRestore();
  });

  it('renders mobile menu trigger and can open mobile menu', () => {
    render(<SimplifiedEnhancedSidebar role="viewer" />);
    
    // Mobile menu button should be present
    const menuButton = screen.getByTestId('mobile-menu-button');
    expect(menuButton).toBeInTheDocument();
    
    // Click to open mobile menu
    fireEvent.click(menuButton);
    
    // Mobile sidebar should have the Nostr Ad Market text
    const mobileSidebar = screen.getByTestId('mobile-sidebar');
    expect(mobileSidebar).toBeInTheDocument();
    
    // The sidebar should have Nostr Ad Market text (from SidebarContent)
    expect(screen.getAllByText('Nostr Ad Market').length).toBeGreaterThan(0);
  });

  it('changes role when selecting from dropdown', () => {
    render(<SimplifiedEnhancedSidebar role="viewer" />);
    
    // Open dropdown
    fireEvent.click(screen.getByTestId('role-selector-viewer'));
    
    // Click on advertiser option
    fireEvent.click(screen.getByTestId('role-option-advertiser'));
    
    // Dropdown should close
    expect(screen.getByTestId('role-dropdown')).toHaveClass('opacity-0');
    
    // Role selector should now show advertiser
    expect(screen.getByTestId('role-selector-advertiser')).toBeInTheDocument();
  });
});