import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LightningWalletBalance from '../../components/LightningWalletBalance';

// Mock fetch
global.fetch = jest.fn();

// Mock the CurrencyAmount component to simplify testing
jest.mock('../../components/CurrencyAmount', () => 
  require('../mocks/CurrencyAmount').default
);

// Mock the CurrencyContext to always return BTC
jest.mock('../../context/CurrencyContext', () => ({
  useCurrency: () => ({ currency: 'BTC', setCurrency: jest.fn(), toggleCurrency: jest.fn() })
}));

// Mock TestModeContext
jest.mock('../../context/TestModeContext', () => ({
  useTestMode: () => ({ isTestMode: true, setIsTestMode: jest.fn() })
}));

// Mock useTestWallet hook
jest.mock('../../hooks/useTestWallet', () => ({
  useTestWallet: () => ({ balance: 125000, updateBalance: jest.fn() })
}));

describe('LightningWalletBalance Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  const mockFetch = (status = 200, data = { balance: 125000 }) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: status === 200,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: jest.fn().mockResolvedValueOnce(data)
    });
  };
  
  it('displays wallet balance when data is loaded', async () => {
    mockFetch();
    render(<LightningWalletBalance />);
    
    // Initially show loading state
    expect(screen.getByText(/Loading wallet balance/i)).toBeInTheDocument();
    
    // After data is loaded
    await waitFor(() => {
      const containerDiv = screen.getByTestId('wallet-balance-container');
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv).toHaveTextContent(/125,000/i);
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/wallet', expect.any(Object));
  });
  
  it('shows error state when fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch(500);
    
    render(<LightningWalletBalance />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch wallet balance/i)).toBeInTheDocument();
      // Balance should be 0 when there's an error fetching the balance
      expect(screen.getByTestId('wallet-balance-container')).toHaveTextContent(/0 sats/i);
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
  
  it('renders compact version correctly', async () => {
    mockFetch();
    
    render(<LightningWalletBalance compact={true} />);
    
    // Wait for the component to load and fetch data
    await waitFor(() => {
      // In compact mode, we shouldn't have the "Lightning Wallet" heading
      expect(screen.queryByText('Lightning Wallet')).not.toBeInTheDocument();
      
      // We should have a CurrencyAmount component rendering balance
      // Get the div that should contain the balance element
      const containerDiv = screen.getByTestId('wallet-balance-container') || document.body;
      expect(containerDiv).toHaveTextContent(/125,000/i);
    });
  });
  
  it('accepts custom display text', async () => {
    mockFetch();
    
    render(
      <LightningWalletBalance 
        displayBefore="Available: " 
        displayAfter=" satoshis" 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Available:/i)).toBeInTheDocument();
      // Find the text content after "Available:"
      const availableText = screen.getByText(/Available:/i);
      expect(availableText.parentNode).toHaveTextContent(/125,000 sats satoshis/i);
    });
  });
});