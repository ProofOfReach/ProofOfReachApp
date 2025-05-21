import { render, screen, fireEvent } from '../test-utils';
import Navbar from '../../components/Navbar';

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
  }),
}));

// Mock the NostrAuthContext
const mockAuth = {
  pubkey: '',
  isTestMode: false
};

const mockSetAuth = jest.fn();

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navbar with logo', () => {
    render(<Navbar />);
    
    const logo = screen.getByAltText('Proof Of Reach');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('handles toggle of mobile menu when logged in', () => {
    // Create a custom auth context with a logged-in user
    const customAuthContext = {
      auth: {
        pubkey: 'test-pubkey-123',
        isLoggedIn: true,
        isTestMode: false,
      },
      setAuth: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      generateTestKeys: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getAuthStatus: jest.fn().mockReturnValue({ isLoggedIn: true, pubkey: 'test-pubkey-123' }),
      isLoadingAuth: false,
    };
    
    render(<Navbar />, { customAuthContext });
    
    // Get the toggle button - there should be only one in the mobile view
    const menuToggle = screen.getByRole('button', { name: '' });
    expect(menuToggle).toBeInTheDocument();
    
    // Mobile menu should be hidden initially
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    
    // Click the mobile menu toggle
    fireEvent.click(menuToggle);
    
    // After clicking, Dashboard should be visible in the mobile menu
    const dashboardLink = screen.getAllByText('Dashboard')[1]; // Get the second Dashboard link (mobile)
    expect(dashboardLink).toBeInTheDocument();
  });

  it('renders authenticated navigation when logged in', () => {
    // Create a custom auth context with a logged-in user
    const customAuthContext = {
      auth: {
        pubkey: 'test-pubkey-123',
        isLoggedIn: true,
        isTestMode: false,
      },
      setAuth: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      generateTestKeys: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getAuthStatus: jest.fn().mockReturnValue({ isLoggedIn: true, pubkey: 'test-pubkey-123' }),
      isLoadingAuth: false,
    };

    render(<Navbar />, { customAuthContext });
    
    // Dashboard link should be visible
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
    
    // Wallet link should be visible
    const walletLink = screen.getByText('Wallet');
    expect(walletLink).toBeInTheDocument();
    expect(walletLink.closest('a')).toHaveAttribute('href', '/dashboard/wallet');
    
    // Logout button should be visible
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });
});