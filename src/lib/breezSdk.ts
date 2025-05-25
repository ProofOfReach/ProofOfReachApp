// BREEZ SDK Integration
// This file provides the Breez SDK implementation for Lightning payments
// It will use the Breez API when you provide your API key

export interface BreezConfig {
  apiKey: string;
  environment?: 'production' | 'staging';
  network?: 'bitcoin' | 'testnet';
}

export interface BreezInvoiceResponse {
  invoice: string;
  payment_hash: string;
  amount_sat: number;
  description: string;
  expiry: number;
}

export interface BreezPaymentResponse {
  payment_hash: string;
  amount_sat: number;
  fee_sat: number;
  status: 'completed' | 'pending' | 'failed';
}

export class BreezSDK {
  private static instance: BreezSDK | null = null;
  private initialized: boolean = false;
  private config: BreezConfig | null = null;
  private baseUrl: string = '';

  // Private constructor for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): BreezSDK {
    if (!BreezSDK.instance) {
      BreezSDK.instance = new BreezSDK();
    }
    return BreezSDK.instance;
  }

  // Initialize the BREEZ SDK with API key
  public async initialize(config: BreezConfig): Promise<void> {
    if (this.initialized) {
      console.log("BREEZ SDK already initialized");
      return;
    }

    try {
      this.config = config;
      
      // Set the base URL based on environment
      this.baseUrl = config.environment === 'staging' 
        ? 'https://api-staging.breez.technology'
        : 'https://api.breez.technology';
      
      // Test the API connection
      await this.testConnection();
      
      this.initialized = true;
      console.log("BREEZ SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize BREEZ SDK:", error);
      throw new Error("Failed to initialize BREEZ SDK. Please check your API key.");
    }
  }

  // Test API connection
  private async testConnection(): Promise<void> {
    if (!this.config?.apiKey) {
      throw new Error("API key is required");
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/node/info`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to connect to Breez API: ${error}`);
    }
  }
  
  // Check if SDK is initialized
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  // Check balance
  public async getBalance(): Promise<number> {
    this.ensureInitialized();
    
    try {
      const response = await fetch(`${this.baseUrl}/v1/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.balance_sat || 0;
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw new Error("Failed to get balance from Breez SDK");
    }
  }

  // Create invoice
  public async createInvoice(
    amountSats: number,
    description: string
  ): Promise<{
    bolt11: string;
    paymentHash: string;
  }> {
    this.ensureInitialized();
    
    try {
      const requestBody = {
        amount_sat: amountSats,
        description: description,
        expiry: 3600 // 1 hour expiry
      };

      const response = await fetch(`${this.baseUrl}/v1/invoice/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create invoice: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const data: BreezInvoiceResponse = await response.json();
      
      return {
        bolt11: data.invoice,
        paymentHash: data.payment_hash,
      };
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error;
    }
  }

  // Pay invoice
  public async payInvoice(
    bolt11: string,
    amountSats?: number
  ): Promise<{
    paymentHash: string;
    feeSats: number;
  }> {
    this.ensureInitialized();
    
    try {
      const requestBody = {
        invoice: bolt11,
        amount_sat: amountSats
      };

      const response = await fetch(`${this.baseUrl}/v1/invoice/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to pay invoice: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const data: BreezPaymentResponse = await response.json();
      
      return {
        paymentHash: data.payment_hash,
        feeSats: data.fee_sat,
      };
    } catch (error) {
      console.error("Failed to pay invoice:", error);
      throw error;
    }
  }

  // Helper to ensure SDK is initialized before use
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("BREEZ SDK not initialized. Call initialize() first.");
    }
  }
}

// Convenience function to get the SDK instance
export const getBreezSDK = (): BreezSDK => {
  return BreezSDK.getInstance();
};

// Convenience function to initialize the SDK
export const initializeBreezSDK = async (config: BreezConfig): Promise<void> => {
  const sdk = getBreezSDK();
  await sdk.initialize(config);
};