/**
 * Type definitions for Nostr NIP-07 browser extension
 */

interface Window {
  nostr?: {
    getUserPublicKey(): Promise<string>;
    signEvent(event: any): Promise<any>;
    getRelays?(): Promise<{ [url: string]: { read: boolean; write: boolean } }>;
    nip04?: {
      encrypt(pubkey: string, plaintext: string): Promise<string>;
      decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
    [key: string]: any;
  };
}