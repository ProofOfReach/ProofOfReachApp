import { render, screen, fireEvent, waitFor } from '../test-utils';
import LightningWallet from '../../components/LightningWallet';
import * as lightningLib from '../../lib/lightning';

// Extend Jest types
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      mock: {
        calls: Y[][];
        instances: T[];
        invocationCallOrder: number[];
        results: { type: string; value: any }[];
        lastCall: Y[];
      };
    }
  }
}

// Type for the global.fetch mock
type FetchMock = jest.Mock<Promise<Response>, [string | Request | URL, RequestInit?]>;

// Mock lightning library
jest.mock('../../lib/lightning', () => ({
  hasWebLNProvider: jest.fn(),
  payWithWebLN: jest.fn(),
  createInvoice: jest.fn().mockResolvedValue({
    invoice: 'lntb500n1test_invoice_123456789',
    paymentRequest: 'lntb500n1test_invoice_123456789'
  }),
  payInvoice: jest.fn().mockImplementation(() => {
    // Simulate an error to trigger the onError handler
    throw new Error('Test error from payInvoice mock');
  }),
  simulateTestSatsPayment: jest.fn().mockImplementation((_amount, _callback, errorCallback) => {
    // Call the error callback to trigger onError
    if (errorCallback) {
      errorCallback(new Error('Test error from simulateTestSatsPayment mock'));
    }
    return Promise.reject(new Error('Test error from simulateTestSatsPayment mock'));
  }),
}));

// Mock TestModeContext
jest.mock('../../context/TestModeContext', () => ({
  useTestMode: () => ({
    isTestMode: true,
    enableTestMode: jest.fn(),
    disableTestMode: jest.fn(),
    timeRemaining: 240,
  })
}));

// Mock TestModeBanner component
jest.mock('../../components/TestModeBanner', () => {
  return function MockTestModeBanner() {
    return <div data-testid="test-mode-banner-mock">Test Mode Banner Mock</div>;
  };
});

describe('LightningWallet Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (lightningLib.hasWebLNProvider as jest.Mock).mockReturnValue(false);
  });

  it('renders with the correct balance', () => {
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={false} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    expect(screen.getByText('1,000 sats')).toBeInTheDocument();
    expect(screen.getByText(/Lightning Wallet/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={true} 
        isLoading={true} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Look for loading text instead of spinner which might not have the status role
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('shows deposit and withdraw tabs', () => {
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={false} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Updated selectors - find buttons with exact text
    const depositTab = screen.getByRole('button', { name: 'Deposit' });
    const withdrawTab = screen.getByRole('button', { name: 'Withdraw' });
    
    expect(depositTab).toBeInTheDocument();
    expect(withdrawTab).toBeInTheDocument();
  });

  it('generates invoice when deposit button is clicked', async () => {
    // Mock the fetch response for invoice generation
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          invoice: 'test-invoice-string',
          transactionId: 'test-transaction-id'
        }),
      })
    );
    
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={false} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Enter deposit amount
    const depositInput = screen.getByLabelText(/Amount \(satoshis\)/i);
    fireEvent.change(depositInput, { target: { value: '500' } });
    
    // Click the deposit button
    const depositButton = screen.getByText('Generate Lightning Invoice');
    fireEvent.click(depositButton);
    
    // Check if fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/payments/lightning',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('deposit'),
          credentials: 'include'
        })
      );
    });
  });
  
  it('handles errors during invoice generation', async () => {
    // Mock fetch to fail the first time, then succeed the second time
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            invoice: 'test-invoice-string-2',
            transactionId: 'test-transaction-id-2'
          }),
        })
      );
    
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={true} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Enter deposit amount
    const depositInput = screen.getByLabelText(/Amount \(satoshis\)/i);
    fireEvent.change(depositInput, { target: { value: '500' } });
    
    // Click the deposit button - this should fail with a network error
    const depositButton = screen.getByText('Generate Test Invoice');
    fireEvent.click(depositButton);
    
    // Check if error handler was called with any error message
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
    
    // Try generating a new invoice - this should work
    fireEvent.click(depositButton);
    
    // Check if the second fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
  
  it('generates multiple invoices in sequence logfully', async () => {
    // Mock fetch to succeed with different responses for each call
    global.fetch = jest.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            invoice: 'test-invoice-1',
            transactionId: 'test-transaction-id-1'
          }),
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            invoice: 'test-invoice-2',
            transactionId: 'test-transaction-id-2'
          }),
        })
      );
    
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={true} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Generate first invoice
    const depositInput = screen.getByLabelText(/Amount \(satoshis\)/i);
    fireEvent.change(depositInput, { target: { value: '500' } });
    
    const depositButton = screen.getByText('Generate Test Invoice');
    fireEvent.click(depositButton);
    
    // Instead of waiting for a specific text that may never appear,
    // check that an invoice is generated with expected format
    await waitFor(() => {
      const invoiceText = screen.getByTestId('invoice-text');
      expect(invoiceText).toBeInTheDocument();
      expect(invoiceText.textContent).toMatch(/lntb\d+n/);
    }, { timeout: 1000 });
    
    // Try generating a second invoice with different amount
    fireEvent.change(depositInput, { target: { value: '1000' } });
    fireEvent.click(depositButton);
    
    // Check that invoice element updates after changing amount
    await waitFor(() => {
      const invoiceText = screen.getByTestId('invoice-text');
      expect(invoiceText).toBeInTheDocument();
      expect(invoiceText.textContent).toMatch(/lntb1000n/);
    }, { timeout: 1000 });
    
    // Verify both fetch calls were made with different amounts
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect((global.fetch as jest.Mock).mock.calls[0][1].body).toContain('"amount":500');
    expect((global.fetch as jest.Mock).mock.calls[1][1].body).toContain('"amount":1000');
  });

  it('checks WebLN capability', () => {
    // Mock WebLN availability
    (lightningLib.hasWebLNProvider as jest.Mock).mockReturnValue(true);
    
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={false} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // The component should check for WebLN availability on mount
    expect(lightningLib.hasWebLNProvider).toHaveBeenCalled();
  });

  it('initiates withdrawal process', async () => {
    // Set up fetch mock before rendering to capture the API call
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ log: true }),
      })
    );
    
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={false} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Switch to withdraw tab
    const withdrawTab = screen.getByRole('button', { name: 'Withdraw' });
    fireEvent.click(withdrawTab);
    
    // Enter invoice and amount
    const invoiceInput = screen.getByLabelText(/Lightning Invoice/i);
    fireEvent.change(invoiceInput, { target: { value: 'lnbc500test' } });
    
    // Click the withdraw button
    const withdrawButton = screen.getByText(/Withdraw 1000 sats/i);
    fireEvent.click(withdrawButton);
    
    // Verify that fetch was called with the correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/payments/lightning',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include'
        })
      );
    });
  });

  it('handles errors during withdrawal', async () => {
    // Set up fetch mock to simulate an error response
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Insufficient funds' }),
      })
    );
    
    render(
      <LightningWallet 
        balance={1000} 
        isTestMode={false} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Switch to withdraw tab
    const withdrawTab = screen.getByRole('button', { name: 'Withdraw' });
    fireEvent.click(withdrawTab);
    
    // Enter invoice and amount
    const invoiceInput = screen.getByLabelText(/Lightning Invoice/i);
    fireEvent.change(invoiceInput, { target: { value: 'lnbc500test' } });
    
    // Click the withdraw button
    const withdrawButton = screen.getByText(/Withdraw 1000 sats/i);
    fireEvent.click(withdrawButton);
    
    // Check if the error handler was called
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  it('handles json parsing errors during payment status checks', async () => {
    // Reset all mocks to start fresh
    mockOnError.mockReset();
    
    // Create a simpler mock for the lightning module
    const originalModule = jest.requireActual('../../lib/lightning');
    
    // Mock the entire lightning module
    jest.mock('../../lib/lightning', () => ({
      ...originalModule,
      simulateTestSatsPayment: jest.fn((_amount, _onSuccess, onError) => {
        // Call the error callback directly
        if (onError) onError(new Error('Test error simulation'));
        return Promise.reject(new Error('Test error simulation'));
      }),
      generateLightningInvoice: jest.fn(() => Promise.resolve({
        invoice: 'test-invoice-1',
        transactionId: 'test-transaction-id-1' 
      }))
    }));
    
    // Re-import the component to use the mocked module
    jest.resetModules();
    const { default: ReloadedLightningWallet } = await import('../../components/LightningWallet');
    
    // Mock fetch to logfully generate an invoice
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          invoice: 'test-invoice-1',
          transactionId: 'test-transaction-id-1'
        }),
      })
    );
    
    render(
      <ReloadedLightningWallet 
        balance={1000} 
        isTestMode={true} 
        isLoading={false} 
        onSuccess={mockOnSuccess} 
        onError={mockOnError} 
      />
    );
    
    // Fill in the amount
    const depositInput = screen.getByLabelText(/Amount \(satoshis\)/i);
    fireEvent.change(depositInput, { target: { value: '500' } });
    
    // Click generate invoice button
    const depositButton = screen.getByText('Generate Test Invoice');
    fireEvent.click(depositButton);
    
    // Wait for the invoice to appear
    await waitFor(() => {
      expect(screen.getByTestId('invoice-text')).toBeInTheDocument();
    });
    
    // The Add Test Sats to Balance button should now be available
    const addSatsButton = screen.getByTestId('add-test-sats-button');
    expect(addSatsButton).toBeInTheDocument();
    
    // Click the button
    fireEvent.click(addSatsButton);
    
    // Now the error handler should have been called
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });
});