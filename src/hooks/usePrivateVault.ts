/**
 * React hook for managing the private ad interaction vault
 */

import { useState, useEffect, useCallback } from 'react';
import { nip19 } from 'nostr-tools';
import { adVault, type AdInteraction } from '../lib/adVault';

interface NostrAPI {
  getPublicKey(): Promise<string>;
  signEvent(event: any): Promise<any>;
  nip04?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
}

declare global {
  interface Window {
    nostr?: NostrAPI;
  }
}

export interface VaultStats {
  totalInteractions: number;
  lastInteraction: number | null;
  uniqueAds: number;
}

export function usePrivateVault() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [npub, setNpub] = useState<string | null>(null);
  const [hasNostrExtension, setHasNostrExtension] = useState(false);
  const [interactions, setInteractions] = useState<AdInteraction[]>([]);
  const [stats, setStats] = useState<VaultStats>({
    totalInteractions: 0,
    lastInteraction: null,
    uniqueAds: 0
  });

  // Check for Nostr extension
  useEffect(() => {
    const checkExtension = () => {
      if (typeof window !== 'undefined') {
        setHasNostrExtension(!!window.nostr);
      }
    };
    
    checkExtension();
    const timer = setTimeout(checkExtension, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load vault data when unlocked
  const loadVaultData = useCallback(async () => {
    if (!adVault.isUnlocked()) return;

    try {
      const [vaultInteractions, vaultStats] = await Promise.all([
        adVault.getInteractions(),
        adVault.getStats()
      ]);
      
      setInteractions(vaultInteractions);
      setStats(vaultStats);
    } catch (error) {
      console.error('Failed to load vault data:', error);
    }
  }, []);

  // Unlock vault with Nostr authentication
  const unlockVault = useCallback(async (): Promise<boolean> => {
    if (!window.nostr) {
      throw new Error('Nostr extension not found. Please install Alby or nos2x.');
    }

    setIsLoading(true);
    try {
      // Get public key
      const userPubkey = await window.nostr.getPublicKey();
      
      // For encryption, we need access to private key operations
      // This is done through the nostr extension's signing capabilities
      const getPrivateKey = async (): Promise<string> => {
        // Since we can't access private keys directly, we'll use a derived approach
        // For now, we'll use the pubkey as a seed for encryption operations
        // In a real implementation, this would use proper key derivation
        return userPubkey; // Simplified for demo - real implementation needs proper key handling
      };

      // Initialize vault
      await adVault.initialize(userPubkey, getPrivateKey);
      
      // Convert to npub format for display
      const userNpub = nip19.npubEncode(userPubkey);
      
      setPubkey(userPubkey);
      setNpub(userNpub);
      setIsUnlocked(true);
      
      // Load existing data
      await loadVaultData();
      
      return true;
    } catch (error) {
      console.error('Failed to unlock vault:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadVaultData]);

  // Log an ad interaction
  const logInteraction = useCallback(async (
    adId: string, 
    action: 'view' | 'click', 
    durationMs: number = 0
  ): Promise<void> => {
    if (!adVault.isUnlocked()) {
      throw new Error('Vault must be unlocked before logging interactions');
    }

    const interaction: AdInteraction = {
      ad_id: adId,
      action,
      duration_ms: durationMs,
      timestamp: Date.now()
    };

    await adVault.logInteraction(interaction);
    await loadVaultData(); // Refresh data
  }, [loadVaultData]);

  // Export vault data
  const exportData = useCallback(async (): Promise<void> => {
    if (!adVault.isUnlocked()) {
      throw new Error('Vault must be unlocked to export data');
    }

    try {
      const exportJson = await adVault.exportData();
      
      // Create and download file
      const blob = new Blob([exportJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ad-vault-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export vault data:', error);
      throw error;
    }
  }, []);

  // Clear vault data
  const clearVault = useCallback(async (): Promise<void> => {
    await adVault.clearVault();
    setIsUnlocked(false);
    setPubkey(null);
    setNpub(null);
    setInteractions([]);
    setStats({
      totalInteractions: 0,
      lastInteraction: null,
      uniqueAds: 0
    });
  }, []);

  // Lock vault (clear session data but keep encrypted data)
  const lockVault = useCallback(() => {
    setIsUnlocked(false);
    setPubkey(null);
    setNpub(null);
    setInteractions([]);
    setStats({
      totalInteractions: 0,
      lastInteraction: null,
      uniqueAds: 0
    });
  }, []);

  return {
    // State
    isUnlocked,
    isLoading,
    pubkey,
    npub,
    hasNostrExtension,
    interactions,
    stats,
    
    // Actions
    unlockVault,
    lockVault,
    logInteraction,
    exportData,
    clearVault,
    refreshData: loadVaultData
  };
}