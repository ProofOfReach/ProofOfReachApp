import { nip19 } from 'nostr-tools';

// Interface for Nostr profile data
export interface NostrProfileData {
  displayName?: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  website?: string;
  nip05?: string;
  lud16?: string;
}

// Function to convert hex pubkey to npub
export function hexToNpub(hexPubkey: string): string {
  try {
    // Add validation to prevent errors with bad input
    if (!hexPubkey || hexPubkey.length !== 64 || !/^[0-9a-f]+$/i.test(hexPubkey)) {
      console.error('Error converting hex to npub: Invalid hex format');
      return '';
    }
    
    // Use the hex string directly - nip19.npubEncode expects a hex string
    return nip19.npubEncode(hexPubkey);
  } catch (error) {
    console.error('Error converting hex to npub:', error);
    return '';
  }
}

// Function to convert npub to hex pubkey
export function npubToHex(npub: string): string {
  try {
    // Add validation to prevent errors with bad input
    if (!npub) {
      console.error('Error converting npub to hex: Empty npub');
      return '';
    }
    
    // If already in hex format, just return it
    if (/^[0-9a-f]{64}$/i.test(npub)) {
      return npub;
    }
    
    // Handle npub format
    if (npub.startsWith('npub1')) {
      try {
        const decoded = nip19.decode(npub);
        if (decoded && decoded.data) {
          return decoded.data as string;
        }
      } catch (decodeError) {
        console.error('Failed to decode npub:', npub, decodeError);
      }
    }
    
    // If we can't convert, return the original as a fallback
    // This allows the system to still attempt showing something
    return npub;
  } catch (error) {
    console.error('Error converting npub to hex:', error);
    // Return the original as fallback
    return npub;
  }
}

// Function to format a Nostr pubkey/npub for display
export function formatNpubForDisplay(npub: string): string {
  try {
    if (!npub) return '';
    
    // For test keys, don't modify
    if (npub.startsWith('pk_test_')) {
      return npub;
    }
    
    // For npub format, show the last 6 digits
    if (npub.startsWith('npub1')) {
      return `...${npub.slice(-6)}`;
    }
    
    // For hex format, convert to npub first
    if (/^[0-9a-f]{64}$/i.test(npub)) {
      const converted = hexToNpub(npub);
      if (converted) {
        return `...${converted.slice(-6)}`;
      }
    }
    
    // Fallback: truncate whatever was provided
    return npub.length > 10 ? `...${npub.slice(-6)}` : npub;
  } catch (error) {
    console.error('Error formatting npub for display:', error);
    return npub;
  }
}

// List of default relays
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io/',
  'wss://relay.primal.net/',
  'wss://nos.lol/',
  'wss://relay.utxo.one/'
];

// Get relays from local storage or use defaults
export function getConfiguredRelays(): string[] {
  if (typeof window === 'undefined') {
    return DEFAULT_RELAYS;
  }
  
  const savedRelays = localStorage.getItem('nostrRelays');
  if (savedRelays) {
    try {
      const parsedRelays = JSON.parse(savedRelays);
      if (Array.isArray(parsedRelays) && parsedRelays.length > 0) {
        return parsedRelays;
      }
    } catch (error) {
      console.error('Error parsing saved relays:', error);
    }
  }
  
  return DEFAULT_RELAYS;
}

// Save relays to local storage
export function saveRelays(relays: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('nostrRelays', JSON.stringify(relays));
  } catch (error) {
    console.error('Error saving relays to local storage:', error);
  }
}

// Check if a relay URL is valid
export function isValidRelayUrl(url: string): boolean {
  // Basic validation - must be websocket URL
  if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
    return false;
  }
  
  try {
    // Check if it's a valid URL
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Fetch profile data from a Nostr relay
export async function fetchNostrProfile(
  pubkey: string, 
  relays: string[] = getConfiguredRelays()
): Promise<NostrProfileData | null> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Always fetch from our backend first - it checks Nostr relays
    const response = await fetch(`/api/nostr/profile?pubkey=${pubkey}`);
    if (response.ok) {
      const data = await response.json();
      if (data.profile) {
        return data.profile;
      }
    }

    // If backend fetch failed or returned no profile, try extension as fallback
    const window_: any = window;
    if (window_?.nostr) {
      try {
        // Check if getPublicKey method exists (all NIP-07 extensions should have this)
        if (typeof window_.nostr.getPublicKey === 'function') {
          // First check if this is the current user's pubkey
          const userPubkey = await window_.nostr.getPublicKey();
          
          // Only try to get metadata if this is the user's own pubkey
          if (userPubkey === pubkey && typeof window_.nostr.getMetadata === 'function') {
            const profileEvent = await window_.nostr.getMetadata();
            if (profileEvent && profileEvent.content) {
              try {
                return JSON.parse(profileEvent.content);
              } catch (e) {
                console.error('Error parsing profile content:', e);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error getting data from extension:', e);
      }
    }
    
    // Return null if we couldn't get the profile from either source
    return null;
  } catch (error) {
    console.error('Error fetching Nostr profile:', error);
    return null;
  }
}

// Create a default avatar based on pubkey (fallback)
export function createDefaultAvatar(pubkey: string): string {
  // Use first 6 characters of pubkey to create a color
  const color = pubkey ? `#${pubkey.substring(0, 6)}` : '#6d28d9';
  
  // Create SVG for default avatar
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}" />
      <circle cx="50" cy="35" r="20" fill="white" />
      <circle cx="50" cy="90" r="35" fill="white" />
    </svg>
  `;
  
  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}