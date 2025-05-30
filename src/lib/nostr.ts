import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { localStorage } from './enhancedStorageService';

// Define Nostr-related types
export interface NostrWindow extends Window {
  nostr?: {
    getUserPublicKey(): Promise<string>;
    signEvent(event: any): Promise<any>;
    nip04?: {
      encrypt(pubkey: UserRole, plaintext: string): Promise<string>;
      decrypt(pubkey: UserRole, ciphertext: string): Promise<string>;
    };
  };
}

export interface NostrEvent {
  id?: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig?: string;
}

export interface TestKeypair {
  publicKey: string;
  privateKey?: string;
  npub?: string;
  nsec?: string;
}

/**
 * Nostr utility module
 * Provides functions for interacting with the Nostr protocol
 */
class NostrHelpers {
  /**
   * Check if the user has a Nostr extension installed
   * @returns Whether the Nostr extension is available
   */
  public hasNostrExtension(): boolean {
    return typeof window !== 'undefined' && !!window.nostr;
  }

  /**
   * Derive a public key from a private key
   * @param privateKey The private key to derive the public key from
   * @returns The derived public key
   */
  public derivePublicKey(privateKey: string): string {
    try {
      // In a real implementation, we would use nostr-tools getUserPublicKey function
      // For now, just return a deterministic value based on the input for testing
      return `pk_derived_${privateKey.substring(0, 8)}`;
    } catch (error) {
      logger.log('Error deriving public key', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return `pk_error_${Date.now()}`;
    }
  }
  
  /**
   * Get the public key from a request object
   * @param req The request object
   * @returns The public key from the request cookies, or null if not found
   */
  public getUserPublicKeyFromRequest(req: any): string | null {
    if (!req || !req.cookies) {
      return null;
    }
    
    return req.cookies.nostr_pubkey || null;
  }
  
  /**
   * Get the Nostr public key from the extension
   * @returns A promise that resolves to the user's public key or null if not available
   */
  public async getNostrPublicKey(): Promise<string | null> {
    try {
      if (!this.hasNostrExtension()) {
        return null;
      }
      
      // Create a promise that times out after 3 seconds
      const timeoutPromise = new Promise<string | null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout waiting for Nostr extension')), 3000);
      });
      
      // Get the public key from the Nostr extension
      const nostrPromise = window.nostr!.getUserPublicKey();
      
      // Race the promises
      const publicKey = await Promise.race([nostrPromise, timeoutPromise]);
      return publicKey;
    } catch (error) {
      console.log('Timeout or error while waiting for Nostr extension:', error);
      return null;
    }
  }

  /**
   * Generate a private key for testing
   * @returns A generated private key
   */
  public generatePrivateKey(): string {
    // Generate a hex string representing 32 bytes (64 hex characters)
    let result = '';
    const hexChars = '0123456789abcdef';
    for (let i = 0; i < 64; i++) {
      result += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
    }
    return result;
  }
  
  /**
   * Get the user's public key from the Nostr extension or test mode
   * This method is different from getNostrPublicKey as it throws errors
   * instead of returning null and is intended for direct API use
   * @returns A promise that resolves to the user's public key
   */
  public async getUserPublicKey(): Promise<string> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      // If we're in test mode, use the test key
      const isTestMode = await this.isTestMode();
      if (isTestMode) {
        const testKeys = await this.getStoredTestKeys();
        if (testKeys?.publicKey) {
          logger.debug('Using test mode public key', { pubkey: testKeys.publicKey });
          return testKeys.publicKey;
        } else {
          // If no test keys exist, generate them
          const newKeys = await this.generateTestKeyPair();
          return newKeys.publicKey;
        }
      }

      // Try to get the public key from the Nostr extension
      const win = window as NostrWindow;
      if (!win.nostr) {
        throw new Error('Nostr extension not found');
      }

      // Call the extension's getUserPublicKey method
      const pubkey = await win.nostr.getUserPublicKey();
      
      if (!pubkey) {
        throw new Error('Failed to get public key from Nostr extension');
      }

      return pubkey;
    } catch (error) {
      logger.log('Error getting Nostr public key', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Sign a Nostr event with the user's private key
   * @param event The Nostr event to sign
   * @returns A promise that resolves to the signed event
   */
  public async signEvent(event: NostrEvent): Promise<NostrEvent> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      // If we're in test mode, create a mock signature
      const isTestMode = await this.isTestMode();
      if (isTestMode) {
        return {
          ...event,
          sig: `test_sig_${uuidv4().replace(/-/g, '')}`
        };
      }

      // Try to sign the event with the Nostr extension
      const win = window as NostrWindow;
      if (!win.nostr) {
        throw new Error('Nostr extension not found');
      }

      // Call the extension's signEvent method
      const signedEvent = await win.nostr.signEvent(event);
      
      if (!signedEvent || !signedEvent.sig) {
        throw new Error('Failed to sign event with Nostr extension');
      }

      return signedEvent;
    } catch (error) {
      logger.log('Error signing Nostr event', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Check if test mode is enabled
   * @returns A promise that resolves to a boolean indicating whether test mode is enabled
   */
  public async isTestMode(): Promise<boolean> {
    try {
      // Try to get the test mode flag from localStorage
      const testModeStr = await localStorage.getItem('isTestMode');
      return testModeStr === 'true';
    } catch (error) {
      logger.warn('Error checking test mode', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  /**
   * Enable test mode
   * @returns A promise that resolves when test mode is enabled
   */
  public async enableTestMode(): Promise<void> {
    try {
      // Set the test mode flag in localStorage
      await localStorage.setItem('isTestMode', 'true');
      
      // Check if we already have test keys
      const testKeys = await this.getStoredTestKeys();
      if (!testKeys?.publicKey) {
        // If not, generate new test keys
        await this.generateTestKeyPair();
      }
      
      logger.info('Test mode enabled');
    } catch (error) {
      logger.log('Error enabling test mode', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Disable test mode
   * @returns A promise that resolves when test mode is disabled
   */
  public async disableTestMode(): Promise<void> {
    try {
      // Remove the test mode flag from localStorage
      await localStorage.removeItem('isTestMode');
      
      logger.info('Test mode disabled');
    } catch (error) {
      logger.log('Error disabling test mode', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Generate a keypair for test purposes (synchronous version for test compatibility)
   * @returns A TestKeypair object with public and private keys
   */
  public generateTestKeyPair(): TestKeypair {
    try {
      // In a real implementation, we would use proper cryptographic functions
      // For testing purposes, we're just generating a random string
      
      let publicKey = '';
      
      try {
        // First try to use the browser's crypto API if available
        if (typeof window !== 'undefined' && window.crypto) {
          const array = new Uint8Array(32);
          window.crypto.getRandomValues(array);
          publicKey = 'pk_test_' + Array.from(array)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .substring(0, 12);
        }
      } catch (cryptoError) {
        logger.log('Error generating test keypair', { 
          error: cryptoError instanceof Error ? cryptoError.message : 'Unknown error' 
        });
      }
      
      // Fallback to a simpler method if crypto API fails
      if (!publicKey) {
        publicKey = 'pk_test_' + uuidv4().replace(/-/g, '').substring(0, 12);
        logger.log('Generated fallback test keypair:', { publicKey });
      }
      
      const privateKey = 'sk_test_' + uuidv4().replace(/-/g, '').substring(0, 16);
      
      // Create npub and nsec formatted versions for test compatibility
      const npub = `npub1${publicKey.substring(8)}`;
      const nsec = `nsec1${privateKey.substring(8)}`;
      
      // Construct a test keypair with all required properties
      const keypair: TestKeypair = {
        publicKey,
        privateKey,
        npub,
        nsec
      };
      
      // Store the keypair in localStorage using the synchronous method
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nostr_test_pk', publicKey);
        window.localStorage.setItem('nostr_test_sk', privateKey);
        logger.log('Test keys stored:', { publicKey });
      }
      
      return keypair;
    } catch (error) {
      logger.log('Error generating test keypair', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      // Return a fallback keypair
      const publicKey = 'pk_test_fallback' + Date.now().toString().substring(6);
      const privateKey = 'sk_test_fallback';
      const fallbackPair = { publicKey, privateKey };
      
      // Store the fallback pair
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nostr_test_pk', publicKey);
        window.localStorage.setItem('nostr_test_sk', privateKey);
      }
      
      return fallbackPair;
    }
  }

  /**
   * Get stored test keys
   * @returns The stored test keys or null if not found
   */
  public getStoredTestKeys(): TestKeypair | null {
    if (typeof window === 'undefined') {
      logger.warn('Cannot get test keys: window is undefined');
      return null;
    }
    
    try {
      // Use synchronous localStorage directly for the test interface
      let publicKey = '';
      let privateKey = '';
      
      if (typeof window !== 'undefined' && window.localStorage) {
        publicKey = window.localStorage.getItem('nostr_test_pk') || '';
        privateKey = window.localStorage.getItem('nostr_test_sk') || '';
      }
      
      if (!publicKey) {
        return null;
      }
      
      // Add the npub and nsec formatted versions for consistency with generateTestKeyPair
      const npub = publicKey ? `npub1${publicKey.substring(8)}` : undefined;
      const nsec = privateKey ? `nsec1${privateKey.substring(8)}` : undefined;
      
      return {
        publicKey,
        privateKey: privateKey || undefined,
        npub,
        nsec
      };
    } catch (error) {
      logger.warn('Error getting stored test keys', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  /**
   * Store test keys in localStorage (for compatibility with tests)
   * @param privateKey The private key to store
   * @param publicKey The public key to store
   */
  public storeTestKeys(privateKey: UserRole, publicKey: string): void {
    if (typeof window === 'undefined') {
      logger.warn('Cannot store test keys: window is undefined');
      return;
    }
    
    try {
      localStorage.setItem('nostr_test_pk', publicKey);
      localStorage.setItem('nostr_test_sk', privateKey);
      logger.log('Test keys stored:', { publicKey });
    } catch (error) {
      logger.warn('Error storing test keys', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Clear stored test keys
   */
  public clearStoredTestKeys(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      logger.warn('Cannot clear test keys: window or localStorage is undefined');
      return;
    }
    
    try {
      // Define keys to be removed
      const keysToRemove = ['nostr_test_pk', 'nostr_test_sk', 'isTestMode'];
      
      // For test environments, use direct localStorage operations
      // This ensures compatibility with Jest tests
      for (const key of keysToRemove) {
        window.localStorage.removeItem(key);
      }
      
      // Log a message
      logger.log('Cleared all test keys and settings');
    } catch (error) {
      logger.warn('Error clearing test keys', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}

// Export a singleton instance
// Create an instance of NostrHelpers
export const nostr = new NostrHelpers();

/**
 * Verify a Nostr signature for authentication
 * This function is used during API authentication
 * @param pubkey The public key that signed the message
 * @param signature The signature to verify
 * @param challenge The challenge/message that was signed
 * @returns Whether the signature is valid
 */
export function verifyNostrSignature(pubkey: UserRole, signature: UserRole, challenge: string): boolean {
  try {
    // In a real implementation, this would use cryptographic verification
    // For this implementation, we'll do a simple check that the signature exists
    if (!pubkey || !signature || !challenge) {
      return false;
    }
    
    // For demo purposes, we'll consider signatures starting with 'valid_' to be valid
    // In production, real crypto verification would be used
    if (signature.startsWith('valid_')) {
      return true;
    }
    
    // In test mode, always return true for testing purposes
    if (typeof window !== 'undefined' && window.localStorage) {
      const isTestMode = window.localStorage.getItem('isTestMode') === 'true';
      if (isTestMode) {
        return true;
      }
    }
    
    // For simplicity, we'll accept signatures longer than 64 chars as "valid"
    // This is NOT secure and just for demonstration
    return signature.length > 64;
  } catch (error) {
    logger.log('Error verifying Nostr signature', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

/**
 * Generate a regular (non-test) Nostr account
 * @returns A TestKeypair object with generated keys
 */
export function generateRegularAccount(): TestKeypair {
  try {
    // Use similar approach as generateTestKeyPair but with different prefix
    let publicKey = '';
    
    try {
      // First try to use the browser's crypto API if available
      if (typeof window !== 'undefined' && window.crypto) {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        publicKey = Array.from(array)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .substring(0, 64);
      }
    } catch (cryptoError) {
      logger.log('Error generating regular keypair', { 
        error: cryptoError instanceof Error ? cryptoError.message : 'Unknown error' 
      });
    }
    
    // Fallback to a simpler method if crypto API fails
    if (!publicKey) {
      publicKey = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').substring(0, 32);
      logger.log('Generated fallback regular keypair');
    }
    
    const privateKey = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').substring(0, 32);
    
    // Create npub and nsec formatted versions 
    const npub = `npub1${publicKey.substring(0, 60)}`;
    const nsec = `nsec1${privateKey.substring(0, 60)}`;
    
    return { publicKey, privateKey, npub, nsec };
  } catch (error) {
    logger.log('Error in generateRegularAccount', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return a fallback account
    const fallbackPublicKey = 'regular_' + Date.now().toString();
    const fallbackPrivateKey = 'private_' + Date.now().toString();
    const npub = `npub1${fallbackPublicKey.substring(8)}`;
    const nsec = `nsec1${fallbackPrivateKey.substring(8)}`;
    
    return { 
      publicKey: fallbackPublicKey, 
      privateKey: fallbackPrivateKey,
      npub,
      nsec
    };
  }
}

/**
 * Store regular account keys in localStorage
 * @param privateKey The private key to store
 * @param publicKey The public key to store
 */
export function storeRegularAccountKeys(privateKey: UserRole, publicKey: string): void {
  if (typeof window === 'undefined') {
    logger.warn('Cannot store regular account keys: window is undefined');
    return;
  }
  
  try {
    localStorage.setItem('nostr_real_pk', publicKey);
    localStorage.setItem('nostr_real_sk', privateKey);
    logger.log('Regular account keys stored');
  } catch (error) {
    logger.warn('Error storing regular account keys', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Export individual functions for easier use and testing
export const hasNostrExtension = () => nostr.hasNostrExtension();
export const getNostrPublicKey = () => nostr.getNostrPublicKey();
export const generatePrivateKey = () => nostr.generatePrivateKey();
// Maintain backward compatibility with tests while using the renamed method
export const getUserPublicKey = () => nostr.getUserPublicKey();
export const derivePublicKey = (privateKey: string) => nostr.derivePublicKey(privateKey);
export const generateTestKeyPair = () => nostr.generateTestKeyPair();
export const getStoredTestKeys = () => nostr.getStoredTestKeys();
export const storeTestKeys = (privateKey: UserRole, publicKey: string) => nostr.storeTestKeys(privateKey, publicKey);
export const clearStoredTestKeys = () => nostr.clearStoredTestKeys();
export const getUserPublicKeyFromRequest = (req: any) => nostr.getUserPublicKeyFromRequest(req);
export const signEvent = (event: NostrEvent) => nostr.signEvent(event);
export const isTestMode = () => nostr.isTestMode();
export const enableTestMode = () => nostr.enableTestMode();
export const disableTestMode = () => nostr.disableTestMode();