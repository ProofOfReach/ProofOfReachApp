// Lightning payment integration with support for both Mock and BREEZ SDK implementations
// This file provides an abstraction layer that can be easily switched between test mode
// and production mode when BREEZ SDK API key is available

import { getBreezSDK, initializeBreezSDK as initBreezSDK } from './breezSdk';

// Types for Lightning functions
export interface Invoice {
  bolt11: string;
  paymentHash: string;
  amountSats: number;
  description: string;
}

export interface Payment {
  paymentHash: string;
  amountSats: number;
  feeSats: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

// Environment and configuration settings
const isTestMode = (req?: any): boolean => {
  // Check if explicitly running in test mode from the request
  if (req) {
    // Check for test mode indicators in various places
    const headerTestMode = req.headers && req.headers['x-test-mode'] === 'true';
    const queryTestMode = req.query && req.query.testMode === 'true';
    const cookieTestMode = req.cookies && req.cookies.testMode === 'true';
    
    // Check for test pubkey format (starting with pk_test_)
    const pubkey = req.headers && (req.headers['x-pubkey'] as string);
    const isTestPubkey = pubkey && pubkey.startsWith('pk_test_');
    
    if (headerTestMode || queryTestMode || cookieTestMode || isTestPubkey) {
      console.log('Test mode detected from request parameters');
      return true;
    }
  }
  
  // Check environment variable as fallback
  // In production, this would be false, and we'd use BREEZ SDK
  const envTestMode = process.env.LIGHTNING_TEST_MODE !== 'false';
  
  // For now, always return true until BREEZ API key is configured
  return envTestMode;
};

// Helper function to generate a random payment hash for mock implementation
const generatePaymentHash = (): string => {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to generate a mock lightning invoice
const generateMockInvoice = (amountSats: number): string => {
  // This creates a fake invoice string that looks like a real one
  return `lnbc${amountSats}n1p0zj8gqpp5${generatePaymentHash()}qdqqxqyjw5qcqpjrzjqtc4zt`;
};

// ===== MOCK IMPLEMENTATION =====
// Mock Lightning implementation used for testing
let mockLightningInitialized = false;

const initializeMockLightning = async () => {
  if (mockLightningInitialized) return;
  
  try {
    // Simply mark it as initialized
    mockLightningInitialized = true;
    console.log("Mock Lightning service initialized logfully");
  } catch (error) {
    console.error("Failed to initialize Mock Lightning service:", error);
    throw new Error("Lightning payment service unavailable");
  }
};

const createMockInvoice = async (
  amountSats: number, 
  description: string
): Promise<Invoice> => {
  await initializeMockLightning();
  
  try {
    // Generate a mock invoice
    const paymentHash = generatePaymentHash();
    const bolt11 = generateMockInvoice(amountSats);
    
    return {
      bolt11,
      paymentHash,
      amountSats,
      description
    };
  } catch (error) {
    console.error("Failed to create mock invoice:", error);
    throw new Error("Could not create Lightning invoice");
  }
};

const payMockInvoice = async (
  bolt11: string,
  amountSats?: number
): Promise<Payment> => {
  await initializeMockLightning();
  
  try {
    // Simulate a logful payment
    return {
      paymentHash: generatePaymentHash(),
      amountSats: amountSats || 1000, // Default to 1000 sats if not specified
      feeSats: Math.floor(Math.random() * 10) + 1, // Random fee between 1-10 sats
      description: "Mock payment",
      status: 'COMPLETED'
    };
  } catch (error) {
    console.error("Failed to pay mock invoice:", error);
    throw new Error("Could not complete Lightning payment");
  }
};

// ===== BREEZ SDK IMPLEMENTATION =====
// This connects to our breezSdk.ts module which will contain the actual BREEZ SDK implementation

let breezSdkInitialized = false;

const initializeBreezSDK = async () => {
  if (breezSdkInitialized) return;
  
  try {
    // When BREEZ SDK is available, this will initialize the SDK with API key
    // For now, we'll just check test mode
    if (!isTestMode()) {
      const apiKey = process.env.BREEZ_API_KEY;
      
      if (!apiKey) {
        console.error("BREEZ API key not available");
        throw new Error("BREEZ API key not configured - please check environment variables");
      }
      
      // Initialize BREEZ SDK with API key
      await initBreezSDK({ 
        apiKey,
        environment: 'production', // Can be 'production' or 'staging'
        network: 'bitcoin' // Can be 'bitcoin' or 'testnet'
      });
    }
    
    breezSdkInitialized = true;
    console.log("BREEZ SDK initialization complete");
  } catch (error) {
    console.error("Failed to initialize BREEZ SDK:", error);
    throw new Error("Lightning payment service unavailable");
  }
};

const createBreezInvoice = async (
  amountSats: number, 
  description: string
): Promise<Invoice> => {
  await initializeBreezSDK();
  
  try {
    // In test mode, use mock implementation
    if (isTestMode()) {
      console.log("Using mock implementation for createInvoice in test mode");
      return await createMockInvoice(amountSats, description);
    }
    
    // In production mode, use BREEZ SDK
    const sdk = getBreezSDK();
    const result = await sdk.createInvoice(amountSats, description);
    
    return {
      bolt11: result.bolt11,
      paymentHash: result.paymentHash,
      amountSats,
      description
    };
  } catch (error) {
    console.error("Failed to create BREEZ invoice:", error);
    throw new Error("Could not create Lightning invoice");
  }
};

const payBreezInvoice = async (
  bolt11: string,
  amountSats?: number
): Promise<Payment> => {
  await initializeBreezSDK();
  
  try {
    // In test mode, use mock implementation
    if (isTestMode()) {
      console.log("Using mock implementation for payInvoice in test mode");
      return await payMockInvoice(bolt11, amountSats);
    }
    
    // In production mode, use BREEZ SDK
    const sdk = getBreezSDK();
    const result = await sdk.payInvoice(bolt11, amountSats);
    
    return {
      paymentHash: result.paymentHash,
      amountSats: amountSats || 0, // We'll get the actual amount from BREEZ SDK when implemented
      feeSats: result.feeSats,
      description: "Payment via BREEZ SDK",
      status: 'COMPLETED'
    };
  } catch (error) {
    console.error("Failed to pay BREEZ invoice:", error);
    throw new Error("Could not complete Lightning payment");
  }
};

// ===== PUBLIC API =====
// These functions will automatically select the appropriate implementation

// Initialize Lightning implementation based on test mode
export const initializeBreezSdk = async () => {
  if (isTestMode()) {
    return initializeMockLightning();
  } else {
    return initializeBreezSDK();
  }
};

// Simulate a test payment for the Lightning wallet component
export const simulateTestSatsPayment = async (
  amount: number,
  onSuccess?: (payment: Payment) => void,
  onError?: (error: Error) => void
): Promise<Payment> => {
  try {
    console.log(`Simulating test payment of ${amount} sats`);
    
    // Create a simulated payment object
    const payment = {
      paymentHash: `test-payment-${Date.now()}`,
      amountSats: amount,
      feeSats: 1,
      description: "Test payment",
      status: 'COMPLETED' as const
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onSuccess) {
      onSuccess(payment);
    }
    
    return payment;
  } catch (error) {
    console.error("Error in test payment simulation:", error);
    
    if (onError) {
      onError(error instanceof Error ? error : new Error("Unknown error in payment simulation"));
    }
    
    throw error;
  }
};

// Create a Lightning invoice
export const createInvoice = async (
  amountSats: number, 
  description: string
): Promise<Invoice> => {
  if (isTestMode()) {
    return createMockInvoice(amountSats, description);
  } else {
    return createBreezInvoice(amountSats, description);
  }
};

// Pay a Lightning invoice
export const payInvoice = async (
  bolt11: string,
  amountSats?: number
): Promise<Payment> => {
  if (isTestMode()) {
    return payMockInvoice(bolt11, amountSats);
  } else {
    return payBreezInvoice(bolt11, amountSats);
  }
};

// ===== WEBLN SUPPORT =====
// WebLN support is independent of the Lightning implementation

// Check if user has WebLN provider
export const hasWebLNProvider = (): boolean => {
  return typeof window !== 'undefined' && 'webln' in window;
};

// Get WebLN provider
export const getWebLNProvider = async () => {
  if (!hasWebLNProvider()) {
    throw new Error("WebLN provider not available");
  }
  
  try {
    await (window as any).webln.enable();
    return (window as any).webln;
  } catch (error) {
    console.error("Failed to enable WebLN:", error);
    throw new Error("Could not connect to WebLN provider");
  }
};

// Pay invoice using WebLN
export const payWithWebLN = async (invoice: string): Promise<any> => {
  try {
    const webln = await getWebLNProvider();
    const result = await webln.sendPayment(invoice);
    return result;
  } catch (error) {
    console.error("WebLN payment failed:", error);
    throw new Error("WebLN payment failed");
  }
};
