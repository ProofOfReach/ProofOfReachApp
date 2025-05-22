import { render, screen, fireEvent, waitFor } from '../test-utils';
import Login from '../../pages/login';
import * as nostrLib from '../../lib/nostr';

// Setup for all tests
beforeAll(() => {
  // Mock fetch globally for all tests
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ success: true })
  });
});

afterAll(() => {
  // Clean up
  jest.restoreAllMocks();
});

// Mock the nostr library
jest.mock('../../lib/nostr', () => ({
  hasNostrExtension: jest.fn(),
  getNostrPublicKey: jest.fn(),
  generateTestKeyPair: jest.fn(),
  storeTestKeys: jest.fn(),
  getStoredTestKeys: jest.fn(),
}));

// Mock the router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/login',
  }),
}));

// Mock the TestModeBanner component
jest.mock('../../components/TestModeBanner', () => {
  return function MockTestModeBanner() {
    return <div data-testid="test-mode-banner-mock">Test Mode Banner Mock</div>;
  };
});

// Mock the API module
jest.mock('../../lib/api', () => ({
  postWithAuth: jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ success: true }),
  })
}));

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login page correctly', () => {
    (nostrLib.hasNostrExtension as jest.Mock).mockReturnValue(true);
    
    render(<Login />);
    
    // Check for heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login to Nostr Ad Marketplace');
    
    // Check for login button
    expect(screen.getByRole('button', { name: /Login with Nostr Extension/i })).toBeInTheDocument();
  });

  it('shows extension not found message when Nostr extension is not available', () => {
    (nostrLib.hasNostrExtension as jest.Mock).mockReturnValue(false);
    
    render(<Login />);
    
    expect(screen.getByText(/No Nostr extension detected/i)).toBeInTheDocument();
    // Check for the developer information section instead of the test mode button
    expect(screen.getByText(/Developer Information/i)).toBeInTheDocument();
    expect(screen.getByText(/For development and testing purposes/i)).toBeInTheDocument();
  });

  it('attempts to login with Nostr when the button is clicked', async () => {
    (nostrLib.hasNostrExtension as jest.Mock).mockReturnValue(true);
    (nostrLib.getNostrPublicKey as jest.Mock).mockResolvedValue('test-pubkey-123');
    
    render(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /Login with Nostr Extension/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(nostrLib.getNostrPublicKey).toHaveBeenCalled();
    });
  });

  it('handles login errors correctly', async () => {
    (nostrLib.hasNostrExtension as jest.Mock).mockReturnValue(true);
    (nostrLib.getNostrPublicKey as jest.Mock).mockRejectedValue(new Error('Login failed'));
    
    render(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /Login with Nostr Extension/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      // The actual implementation uses the error message from the exception
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });
});