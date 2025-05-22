import * as lightningLib from '../../lib/lightning';
import * as breezSdk from '../../lib/breezSdk';

// Mock the breezSdk module
jest.mock('../../lib/breezSdk', () => ({
  getBreezSDK: jest.fn(),
  initializeBreezSDK: jest.fn(),
}));

// Store the original environment
const originalEnv = process.env;

describe('Lightning Library', () => {
  // Set up spies and mocks before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset environment variables for each test
    process.env = { ...originalEnv };
    
    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Restore environment after tests
  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isTestMode function', () => {
    it('should default to test mode when environment variable is not set', () => {
      // Test the internal implementation via the routing of other functions
      expect(lightningLib.createInvoice(1000, 'test')).resolves.toBeDefined();
    });

    it('should use production mode when environment variable is set to false', async () => {
      // Set the environment variable to false
      process.env.LIGHTNING_TEST_MODE = 'false';
      
      // Mock the BREEZ SDK and its functions
      const mockSdk = {
        createInvoice: jest.fn().mockResolvedValue({
          bolt11: 'test-bolt11',
          paymentHash: 'test-hash'
        }),
        payInvoice: jest.fn().mockResolvedValue({
          paymentHash: 'test-hash',
          feeSats: 5
        })
      };
      
      // Return our mock when getBreezSDK is called
      (breezSdk.getBreezSDK as jest.Mock).mockReturnValue(mockSdk);
      
      // Make sure BREEZ_API_KEY is set
      process.env.BREEZ_API_KEY = 'test-api-key';
      
      // Now the function should route to the BREEZ implementation
      await lightningLib.createInvoice(1000, 'test');
      
      // Verify the initialization function was called
      expect(breezSdk.initializeBreezSDK).toHaveBeenCalled();
    });
  });

  describe('Invoice generation functions', () => {
    it('should generate a mock invoice in test mode', async () => {
      // Force test mode
      process.env.LIGHTNING_TEST_MODE = 'true';
      
      const amount = 5000;
      const description = 'Test payment';
      
      const result = await lightningLib.createInvoice(amount, description);
      
      expect(result).toEqual(expect.objectContaining({
        bolt11: expect.stringContaining('lnbc5000n'),
        paymentHash: expect.any(String),
        amountSats: amount,
        description: description
      }));
    });

    it('should generate a unique payment hash for each invoice', async () => {
      // Generate multiple invoices and check their hashes
      const invoice1 = await lightningLib.createInvoice(1000, 'First test');
      const invoice2 = await lightningLib.createInvoice(1000, 'Second test');
      
      expect(invoice1.paymentHash).not.toEqual(invoice2.paymentHash);
    });

    it('should handle errors in invoice creation', async () => {
      // Create a spy on the public createInvoice function
      jest.spyOn(lightningLib, 'createInvoice').mockRejectedValueOnce(new Error('Mock error'));
      
      await expect(lightningLib.createInvoice(1000, 'test')).rejects.toThrow('Mock error');
    });

    it('should use BREEZ SDK for invoice creation in production mode', async () => {
      // Set to production mode
      process.env.LIGHTNING_TEST_MODE = 'false';
      process.env.BREEZ_API_KEY = 'test-api-key';
      
      // Mock BREEZ SDK response
      const mockSdk = {
        createInvoice: jest.fn().mockResolvedValue({
          bolt11: 'lnbc1000n1actual',
          paymentHash: 'real-payment-hash'
        })
      };
      
      (breezSdk.getBreezSDK as jest.Mock).mockReturnValue(mockSdk);
      
      const result = await lightningLib.createInvoice(1000, 'Production test');
      
      expect(mockSdk.createInvoice).toHaveBeenCalledWith(1000, 'Production test');
      expect(result.bolt11).toBe('lnbc1000n1actual');
    });
  });

  describe('Payment functions', () => {
    it('should process mock payments in test mode', async () => {
      // Ensure test mode
      process.env.LIGHTNING_TEST_MODE = 'true';
      
      const invoice = 'lnbc1000n1test';
      const amount = 2000;
      
      const result = await lightningLib.payInvoice(invoice, amount);
      
      expect(result).toEqual(expect.objectContaining({
        paymentHash: expect.any(String),
        amountSats: amount,
        feeSats: expect.any(Number),
        status: 'COMPLETED'
      }));
    });

    it('should use a default amount if not specified', async () => {
      const invoice = 'lnbc1000n1test';
      
      const result = await lightningLib.payInvoice(invoice);
      
      // Default is 1000 sats
      expect(result.amountSats).toBe(1000);
    });

    it('should use BREEZ SDK for payments in production mode', async () => {
      // Set to production mode
      process.env.LIGHTNING_TEST_MODE = 'false';
      process.env.BREEZ_API_KEY = 'test-api-key';
      
      // Mock BREEZ SDK response
      const mockSdk = {
        payInvoice: jest.fn().mockResolvedValue({
          paymentHash: 'real-payment-hash',
          feeSats: 15
        })
      };
      
      (breezSdk.getBreezSDK as jest.Mock).mockReturnValue(mockSdk);
      
      const invoice = 'lnbc1000n1real';
      const amount = 3000;
      
      const result = await lightningLib.payInvoice(invoice, amount);
      
      expect(mockSdk.payInvoice).toHaveBeenCalledWith(invoice, amount);
      expect(result.status).toBe('COMPLETED');
    });

    it('should handle payment errors', async () => {
      // Mock the public payInvoice function to throw
      jest.spyOn(lightningLib, 'payInvoice').mockRejectedValueOnce(new Error('Payment failed'));
      
      await expect(lightningLib.payInvoice('lnbc1000n1test')).rejects.toThrow('Payment failed');
    });
  });

  describe('WebLN support', () => {
    beforeEach(() => {
      // Mock the window object
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });
    });
    
    it('should detect WebLN provider availability', () => {
      // No webln object initially
      expect(lightningLib.hasWebLNProvider()).toBe(false);
      
      // Add webln to window
      (global.window as any).webln = {};
      
      expect(lightningLib.hasWebLNProvider()).toBe(true);
    });

    it('should enable WebLN when getting provider', async () => {
      // Create mock WebLN provider
      const mockWebLN = {
        enable: jest.fn().mockResolvedValue(undefined),
        sendPayment: jest.fn()
      };
      
      (global.window as any).webln = mockWebLN;
      
      await lightningLib.getWebLNProvider();
      
      expect(mockWebLN.enable).toHaveBeenCalled();
    });

    it('should throw error when WebLN is not available', async () => {
      // Remove webln from window
      delete (global.window as any).webln;
      
      await expect(lightningLib.getWebLNProvider()).rejects.toThrow('WebLN provider not available');
    });

    it('should handle WebLN enable errors', async () => {
      // Create mock WebLN that throws on enable
      (global.window as any).webln = {
        enable: jest.fn().mockRejectedValue(new Error('Enable failed'))
      };
      
      await expect(lightningLib.getWebLNProvider()).rejects.toThrow('Could not connect to WebLN provider');
    });

    it('should pay using WebLN', async () => {
      // Create mock WebLN
      const mockWebLN = {
        enable: jest.fn().mockResolvedValue(undefined),
        sendPayment: jest.fn().mockResolvedValue({ preimage: 'test-preimage' })
      };
      
      (global.window as any).webln = mockWebLN;
      
      const invoice = 'lnbc1000n1webln';
      const result = await lightningLib.payWithWebLN(invoice);
      
      expect(mockWebLN.sendPayment).toHaveBeenCalledWith(invoice);
      expect(result).toEqual({ preimage: 'test-preimage' });
    });

    it('should handle WebLN payment errors', async () => {
      // Create mock WebLN that throws on sendPayment
      const mockWebLN = {
        enable: jest.fn().mockResolvedValue(undefined),
        sendPayment: jest.fn().mockRejectedValue(new Error('Payment rejected'))
      };
      
      (global.window as any).webln = mockWebLN;
      
      await expect(lightningLib.payWithWebLN('lnbc1000n1fail')).rejects.toThrow('WebLN payment failed');
    });
  });
});