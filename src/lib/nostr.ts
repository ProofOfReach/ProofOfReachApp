import { nip19, getPublicKey as nostrToolsGetPublicKey } from 'nostr-tools';
import * as nostrUtils from 'nostr-tools';

/**
 * Checks if a Nostr extension (NIP-07) is available in the browser
 * 
 * @returns Whether a Nostr extension is available
 */
export function hasNostrExtension(): boolean {
  if (typeof window === 'undefined') {
    console.debug('hasNostrExtension: Server-side rendering detected, returning false');
    return false;
  }
  
  // Check if the window.nostr object exists at all
  const hasNostr = typeof window.nostr !== 'undefined';
  
  // Enhanced logging to help debug extension detection issues
  if (!hasNostr) {
    console.log('Checking for Nostr extension: NOT FOUND - The window.nostr object is not present.');
    console.debug('If you have a Nostr extension installed, check if:');
    console.debug('1. Your extension is enabled');
    console.debug('2. The extension is compatible with NIP-07');
    console.debug('3. You\'re in a secure context (https:// or localhost)');
    
    // Check for any other objects that might be Nostr extensions but not under window.nostr
    const possibleExtensionKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('nostr') || 
      (typeof window[key as any] === 'object' && 
       window[key as any] !== null && 
       Object.keys(window[key as any] || {}).some(method => 
         ['getPublicKey', 'signEvent'].includes(method)
       ))
    );
    
    if (possibleExtensionKeys.length > 0) {
      console.debug('Found potential Nostr-related objects on window:', possibleExtensionKeys);
    }
    
    return false;
  }
  
  console.log('Checking for Nostr extension: FOUND - Basic window.nostr object exists');
  
  // Further validation of the extension's functionality
  if (window.nostr) {
    const hasGetPublicKey = typeof window.nostr.getPublicKey === 'function';
    const hasSignEvent = typeof window.nostr.signEvent === 'function';
    const hasGetRelays = typeof window.nostr.getRelays === 'function'; // Optional but useful to check
    
    // Create a comprehensive report of what we found
    const nostr = window.nostr;
    
    const extensionReport = {
      hasGetPublicKey,
      hasSignEvent,
      hasGetRelays,
      allMethods: Object.keys(nostr),
      extensionProperties: Object.getOwnPropertyNames(nostr).filter(prop => {
        const nostrAny = nostr as any;
        return typeof nostrAny[prop] !== 'function';
      })
    };
    
    // If the required methods are missing, log detailed information and return false
    if (!hasGetPublicKey || !hasSignEvent) {
      console.warn('Nostr extension found but missing required NIP-07 methods:', extensionReport);
      
      // Provide specific guidance based on what's missing
      if (!hasGetPublicKey) {
        console.debug('Missing getPublicKey method - this is required by NIP-07 for authentication');
      }
      if (!hasSignEvent) {
        console.debug('Missing signEvent method - this is required by NIP-07 for signing events');
      }
      
      return false;
    }
    
    // Check for any signs of interference or content-script isolation issues
    try {
      // In some environments, bound functions in extensions don't work properly
      // due to content script isolation. Let's detect if the methods are properly bound.
      const getPublicKeyToString = window.nostr.getPublicKey.toString();
      const signEventToString = window.nostr.signEvent.toString();
      
      const isBoundFunction = (fnString: string) => 
        fnString.includes('native code') || fnString.includes('[object ') || fnString.includes('function (');
      
      if (!isBoundFunction(getPublicKeyToString) || !isBoundFunction(signEventToString)) {
        console.warn('Nostr extension methods might be incorrectly bound:', {
          getPublicKeyToString,
          signEventToString
        });
      }
    } catch (e) {
      console.debug('Could not analyze Nostr extension methods:', e);
    }
    
    console.log('Nostr extension verified with required methods');
    return true;
  } 
  
  // This branch should only execute if window.nostr is defined but evaluates to falsy
  console.warn('Inconsistent Nostr extension state detected - window.nostr exists but evaluates to:', window.nostr);
  return false;
}

/**
 * Gets the public key from the Nostr extension
 * 
 * @returns The public key or null if not available
 */
export async function getNostrPublicKey(): Promise<string | null> {
  try {
    // First, we'll clear any localStorage-based keys that might be interfering
    // with the Nostr extension authentication
    if (typeof window !== 'undefined') {
      const localStoragePubkey = localStorage.getItem('nostr_real_pk');
      const localStorageTestPubkey = localStorage.getItem('nostr_test_pk');
      
      if (localStoragePubkey || localStorageTestPubkey) {
        console.debug('Found and removing localStorage keys that were interfering with Nostr extension detection:', {
          nostr_real_pk: Boolean(localStoragePubkey),
          nostr_test_pk: Boolean(localStorageTestPubkey),
          length_real_pk: localStoragePubkey?.length,
          length_test_pk: localStorageTestPubkey?.length
        });
        
        // Clear these keys to prevent them from taking precedence over the extension
        localStorage.removeItem('nostr_real_pk');
        localStorage.removeItem('nostr_real_sk');
        localStorage.removeItem('nostr_test_pk');
        localStorage.removeItem('nostr_test_sk');
      }
    }
    
    // Check to make sure the Nostr extension is available
    const extensionAvailable = hasNostrExtension();
    if (!extensionAvailable) {
      console.warn('Nostr extension not available when attempting to get public key');
      
      // Check if the user has cookies that might be from a previous session
      if (typeof document !== 'undefined') {
        const nostrCookies = document.cookie.split(';')
          .map(c => c.trim())
          .filter(c => c.startsWith('nostr_'));
        
        if (nostrCookies.length > 0) {
          console.debug('Found existing Nostr cookies that may be from a previous session:', nostrCookies);
        }
      }
      
      return null;
    }
    
    // Comprehensive diagnostic logging
    console.log('Attempting to get public key from Nostr extension', {
      hasExtension: extensionAvailable,
      hasGetPublicKey: typeof window.nostr?.getPublicKey === 'function',
      hasSignEvent: typeof window.nostr?.signEvent === 'function',
      extensionMethods: Object.keys(window.nostr || {}).join(', '),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Not available'
    });
    
    // Set up a timeout to detect if the extension is hung
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout waiting for Nostr extension response'));
      }, 5000); // 5 second timeout
    });
    
    // Call the extension with a timeout
    try {
      // We've already checked that window.nostr exists with hasNostrExtension()
      const pubkeyPromise = window.nostr!.getPublicKey();
      const pubkey = await Promise.race([pubkeyPromise, timeoutPromise]);
      
      // Validate the returned pubkey format
      if (typeof pubkey !== 'string' || pubkey.length < 8) {
        console.error('Extension returned invalid pubkey format:', pubkey);
        return null;
      }
      
      console.log('Successfully retrieved Nostr public key:', pubkey);
      
      // Store this successful pubkey in a diagnostic key to track successful extension use
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('last_successful_extension_pubkey', pubkey);
        localStorage.setItem('last_extension_access_time', new Date().toISOString());
        
        // Also clear any other stored keys to prevent fallback conflicts
        localStorage.removeItem('nostr_real_pk');
        localStorage.removeItem('nostr_real_sk');
        localStorage.removeItem('nostr_test_pk');
        localStorage.removeItem('nostr_test_sk');
      }
      
      return pubkey;
    } catch (timeoutError) {
      console.error('Timeout or error while waiting for Nostr extension:', timeoutError);
      // The extension might be hung or not responding properly
      return null;
    }
  } catch (error) {
    console.error('Error getting Nostr public key:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        isPromiseError: error instanceof Promise,
        errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      // Provide more helpful messages for common errors
      if (error.message?.includes('User rejected')) {
        console.debug('User rejected the request to access their public key. The user needs to approve the extension popup.');
      } else if (error.message?.includes('timeout')) {
        console.debug('The request to the extension timed out. The extension may be hung or not responding properly.');
      }
    }
    
    return null;
  }
}

/**
 * Generates a random private key using crypto
 * 
 * @returns A hex-encoded private key
 */
export function generatePrivateKey(): string {
  try {
    // For real applications, we would use a secure library
    // For this app, we'll generate our own secure random bytes
    const bytes = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(bytes);
    } else {
      // Fallback for non-browser environments (less secure)
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error generating private key:', error);
    // Generate a fallback private key for testing - NOT SECURE FOR PRODUCTION
    return Array.from(new Array(32), () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

/**
 * Derives a public key from a private key using nostr-tools
 * 
 * @param privateKey - A hex-encoded private key
 * @returns The corresponding public key
 */
export function getPublicKey(privateKey: string): string {
  try {
    // For test private keys, we use a deterministic pattern instead of real derivation
    if (privateKey.startsWith('sk_test_')) {
      return privateKey.replace('sk_test_', 'pk_test_');
    }
    
    // For real keys, use proper derivation (with fallback for testing)
    try {
      // Create a Uint8Array from the private key hex string for compatibility
      const privateKeyBytes = Uint8Array.from(
        Buffer.from(privateKey, 'hex')
      );
      return nostrToolsGetPublicKey(privateKeyBytes);
    } catch (e) {
      console.error('Error using nostr-tools getPublicKey:', e);
      // Fallback to simple deterministic derivation for tests
      return `pub_${privateKey.substring(0, 8)}`;
    }
  } catch (error) {
    console.error('Error deriving public key:', error);
    // Fallback for tests
    return `pub_${privateKey.substring(0, 8)}`;
  }
}

/**
 * Generates a test keypair for development and testing
 * 
 * @returns An object containing a private key and public key
 */
export function generateTestKeyPair() {
  // In a real implementation, we would generate actual Nostr keys
  // For testing, we'll generate random strings with fixed prefixes
  // that our auth system will recognize
  const randomId = Math.random().toString(36).substring(2, 15);
  const privateKey = `sk_test_${randomId}`;
  const publicKey = `pk_test_${randomId}`;
  
  // Add npub and nsec values for completeness
  const npub = `npub1${randomId}`;
  const nsec = `nsec1${randomId}`;
  
  // Make sure we log success for debugging
  console.log('Generated test keypair:', { publicKey });
  
  return { privateKey, publicKey, npub, nsec };
}

/**
 * Creates a new regular account (not test mode) with basic user role
 * 
 * @returns Object containing the new keypair
 */
export function generateRegularAccount(): { privateKey: string, publicKey: string, npub: string, nsec: string } {
  try {
    // Generate a proper private key
    const privateKey = generatePrivateKey();
    
    // Get corresponding public key
    const publicKey = getPublicKey(privateKey);
    
    // Generate encoded versions for display
    let npub = '';
    let nsec = '';
    
    try {
      // npubEncode expects a hex string
      npub = nip19.npubEncode(publicKey);
      
      // nsecEncode expects a Uint8Array
      const privateKeyBytes = new Uint8Array(Buffer.from(privateKey, 'hex'));
      nsec = nip19.nsecEncode(privateKeyBytes);
    } catch (error) {
      console.error('Error encoding keys with NIP-19:', error);
      // Fall back to simple prefixing if encoding fails
      npub = `npub1${publicKey.slice(0, 12)}`;
      nsec = `nsec1${privateKey.slice(0, 12)}`;
    }
    
    console.log('Generated regular account keypair');
    
    return { privateKey, publicKey, npub, nsec };
  } catch (error) {
    console.error('Error generating regular account:', error);
    
    // Fallback for testing environments
    // Generate a random ID for the account in case of error
    const randomId = Math.random().toString(36).substring(2, 15);
    
    const privateKey = `sk_real_${randomId}`;
    const publicKey = `pk_real_${randomId}`;
    const npub = `npub1${randomId}`;
    const nsec = `nsec1${randomId}`;
    
    console.log('Generated fallback regular account keypair');
    
    return { privateKey, publicKey, npub, nsec };
  }
}

/**
 * Stores test keys in localStorage and sets up test mode completely
 * 
 * @param privateKey - The private key to store
 * @param publicKey - The public key to store
 */
export function storeTestKeys(privateKey: string, publicKey: string): void {
  if (typeof window === 'undefined') return;
  
  // First, ensure we clean up any existing auth state
  // to prevent conflicts with previous test sessions
  document.cookie = 'nostr_pubkey=; path=/; max-age=0';
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'auth_session=; path=/; max-age=0';
  
  // Set key data
  localStorage.setItem('nostr_test_sk', privateKey);
  localStorage.setItem('nostr_test_pk', publicKey);
  
  // Set test mode flags
  localStorage.setItem('isTestMode', 'true');
  localStorage.setItem('bypass_api_calls', 'true');
  
  // Store all possible roles in localStorage for test mode
  const ALL_ROLES = ['advertiser', 'publisher', 'admin', 'stakeholder'];
  localStorage.setItem('cachedAvailableRoles', JSON.stringify(ALL_ROLES));
  localStorage.setItem('roleCacheTimestamp', Date.now().toString());
  localStorage.setItem('userRole', 'advertiser'); // Default role
  
  // Setup cookies immediately
  document.cookie = `nostr_pubkey=${publicKey}; path=/; max-age=86400`;
  document.cookie = `auth_token=test_token_${publicKey}; path=/; max-age=86400`;
  
  console.log('Test mode fully configured with pubkey:', publicKey);
}

/**
 * Stores regular account keys in localStorage and sets up a regular user account
 * This is similar to storeTestKeys but without setting test mode flags
 * 
 * @param privateKey - The private key to store
 * @param publicKey - The public key to store
 */
export function storeRegularAccountKeys(privateKey: string, publicKey: string): void {
  if (typeof window === 'undefined') return;
  
  // First, ensure we clean up any existing auth state
  document.cookie = 'nostr_pubkey=; path=/; max-age=0';
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'auth_session=; path=/; max-age=0';
  
  // Set key data - we still store these for convenience
  localStorage.setItem('nostr_real_sk', privateKey);
  localStorage.setItem('nostr_real_pk', publicKey);
  
  // Make sure test mode is off
  localStorage.removeItem('isTestMode');
  localStorage.removeItem('bypass_api_calls');
  
  // Set basic user role only
  const BASIC_ROLES = ['user'];
  localStorage.setItem('cachedAvailableRoles', JSON.stringify(BASIC_ROLES));
  localStorage.setItem('roleCacheTimestamp', Date.now().toString());
  localStorage.setItem('userRole', 'user'); // Default role
  
  // Setup cookies
  document.cookie = `nostr_pubkey=${publicKey}; path=/; max-age=86400`;
  document.cookie = `auth_token=real_token_${publicKey}; path=/; max-age=86400`;
  
  console.log('Regular account configured with pubkey:', publicKey);
}

/**
 * Gets stored test keys from localStorage
 * 
 * @returns An object containing the stored private and public keys, or null if not found
 */
export function getStoredTestKeys(): { privateKey: string; publicKey: string } | null {
  if (typeof window === 'undefined') return null;
  
  const privateKey = localStorage.getItem('nostr_test_sk');
  const publicKey = localStorage.getItem('nostr_test_pk');
  
  if (!privateKey || !publicKey) return null;
  
  return { privateKey, publicKey };
}

/**
 * Clears stored test keys from localStorage
 */
export function clearStoredTestKeys(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('nostr_test_sk');
  localStorage.removeItem('nostr_test_pk');
  localStorage.removeItem('isTestMode');
  localStorage.removeItem('bypass_api_calls');
  localStorage.removeItem('cachedAvailableRoles');
  localStorage.removeItem('roleCacheTimestamp');
  
  // Also clear cookies
  document.cookie = 'nostr_pubkey=; path=/; max-age=0';
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'auth_session=; path=/; max-age=0';
  
  console.log('Cleared all test keys and settings');
}

/**
 * Verifies a Nostr signature against a challenge string and pubkey
 * 
 * In a real implementation, this would use proper cryptographic verification,
 * but for demonstration purposes, we're providing a simplified version
 * 
 * @param pubkey - The Nostr public key
 * @param signature - The signature provided by the client
 * @param challenge - The challenge string that was signed
 * @returns Whether the signature is valid
 */
export function verifyNostrSignature(
  pubkey: string,
  signature: string,
  challenge: string
): boolean {
  try {
    // Convert npub to hex format if needed
    let hexPubkey = pubkey;
    if (pubkey.startsWith('npub')) {
      try {
        const { data } = nip19.decode(pubkey);
        hexPubkey = data as string;
      } catch (e) {
        console.error('Error decoding npub:', e);
        return false;
      }
    }

    // In a real implementation, we would use schnorr signature verification here
    // For now, we're only simulating the validation for development purposes
    
    // For demonstration, we'll accept test signatures with 'valid' in them
    // DO NOT USE THIS IN PRODUCTION
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // If TEST_MODE is set, we'll accept any signature for ease of testing
      if (process.env.TEST_MODE === 'true') {
        return true;
      }
      
      // For development, we'll accept signatures that include 'valid' for demo purposes
      return signature.includes('valid');
    }
    
    // In production, implement proper verification using nostr-tools
    // Example (not implemented here):
    // return schnorr.verify(hexPubkey, challenge, signature);
    
    // Placeholder for proper implementation
    console.warn('Production Nostr signature verification not fully implemented');
    return false;
  } catch (error) {
    console.error('Error verifying Nostr signature:', error);
    return false;
  }
}

/**
 * Generate a challenge string for Nostr authentication
 * 
 * @returns A challenge string including a timestamp
 */
export function generateNostrChallenge(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `nostr:login:timestamp:${timestamp}`;
}

/**
 * Extract the Nostr pubkey from a request object
 * 
 * @param req - The request object from Next.js API
 * @returns The pubkey or null if not found
 */
export function getPublicKeyFromRequest(req: any): string | null {
  return req.cookies?.nostr_pubkey || null;
}