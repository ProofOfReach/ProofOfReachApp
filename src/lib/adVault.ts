/**
 * Private Ad Interaction Vault
 * Handles client-side encryption and storage of ad interaction data
 */

import { nip04 } from 'nostr-tools';

export interface AdInteraction {
  ad_id: string;
  action: 'view' | 'click';
  duration_ms: number;
  timestamp: number;
}

export interface EncryptedVaultData {
  pubkey: string;
  encryptedData: string;
  lastUpdated: number;
}

export class AdVault {
  private pubkey: string | null = null;
  private privateKey: string | null = null;

  constructor() {
    // Initialize with stored pubkey if available
    if (typeof window !== 'undefined') {
      this.pubkey = localStorage.getItem('vault_pubkey');
    }
  }

  /**
   * Initialize vault with user's Nostr keys
   */
  async initialize(pubkey: string, getPrivateKey: () => Promise<string>): Promise<void> {
    this.pubkey = pubkey;
    
    // Store pubkey for session persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('vault_pubkey', pubkey);
    }
    
    // Get private key for encryption operations
    this.privateKey = await getPrivateKey();
  }

  /**
   * Log an ad interaction (encrypted)
   */
  async logInteraction(interaction: AdInteraction): Promise<void> {
    if (!this.pubkey || !this.privateKey) {
      throw new Error('Vault not initialized. Please authenticate first.');
    }

    // Get existing interactions
    const existingInteractions = await this.getInteractions();
    
    // Add new interaction
    const updatedInteractions = [...existingInteractions, interaction];
    
    // Encrypt and store
    await this.storeEncryptedData(updatedInteractions);
  }

  /**
   * Get all decrypted interactions for authenticated user
   */
  async getInteractions(): Promise<AdInteraction[]> {
    if (!this.pubkey || !this.privateKey) {
      return [];
    }

    try {
      const encryptedData = this.getStoredEncryptedData();
      if (!encryptedData) {
        return [];
      }

      // Decrypt using NIP-04
      const decryptedJson = await nip04.decrypt(this.privateKey, this.pubkey, encryptedData.encryptedData);
      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error('Failed to decrypt vault data:', error);
      return [];
    }
  }

  /**
   * Export vault data for user download
   */
  async exportData(): Promise<string> {
    const interactions = await this.getInteractions();
    return JSON.stringify({
      pubkey: this.pubkey,
      interactions,
      exportedAt: Date.now(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Clear all vault data
   */
  async clearVault(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`vault_data_${this.pubkey}`);
      localStorage.removeItem('vault_pubkey');
    }
    this.pubkey = null;
    this.privateKey = null;
  }

  /**
   * Check if user has granted permission to decrypt their vault
   */
  isUnlocked(): boolean {
    return !!(this.pubkey && this.privateKey);
  }

  /**
   * Get vault statistics
   */
  async getStats(): Promise<{
    totalInteractions: number;
    lastInteraction: number | null;
    uniqueAds: number;
  }> {
    const interactions = await this.getInteractions();
    
    return {
      totalInteractions: interactions.length,
      lastInteraction: interactions.length > 0 
        ? Math.max(...interactions.map(i => i.timestamp))
        : null,
      uniqueAds: new Set(interactions.map(i => i.ad_id)).size
    };
  }

  /**
   * Store encrypted data locally
   */
  private async storeEncryptedData(interactions: AdInteraction[]): Promise<void> {
    if (!this.pubkey || !this.privateKey) {
      throw new Error('Cannot store data without valid keys');
    }

    // Encrypt using NIP-04
    const dataJson = JSON.stringify(interactions);
    const encryptedData = await nip04.encrypt(this.privateKey, this.pubkey, dataJson);
    
    const vaultData: EncryptedVaultData = {
      pubkey: this.pubkey,
      encryptedData,
      lastUpdated: Date.now()
    };

    // Store locally (could be extended to remote storage)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`vault_data_${this.pubkey}`, JSON.stringify(vaultData));
    }
  }

  /**
   * Retrieve stored encrypted data
   */
  private getStoredEncryptedData(): EncryptedVaultData | null {
    if (typeof window === 'undefined' || !this.pubkey) {
      return null;
    }

    const stored = localStorage.getItem(`vault_data_${this.pubkey}`);
    return stored ? JSON.parse(stored) : null;
  }
}

// Global vault instance
export const adVault = new AdVault();