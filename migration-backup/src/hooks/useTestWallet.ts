import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Custom hook for managing test mode wallet balance
 * This hook provides the current test wallet balance and automatically
 * updates when the balance changes in localStorage
 */
export function useTestWallet(defaultBalance = 100000) {
  // Initialize state from localStorage if available
  const [balance, setBalance] = useState(() => {
    if (typeof window === 'undefined') return defaultBalance;
    
    try {
      const storedBalance = localStorage.getItem('testWalletBalance');
      return storedBalance ? parseInt(storedBalance, 10) : defaultBalance;
    } catch (error) {
      logger.log('Error getting test wallet balance from localStorage:', error);
      return defaultBalance;
    }
  });

  // Update balance when localStorage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handler for storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'testWalletBalance' && event.newValue) {
        try {
          const newBalance = parseInt(event.newValue, 10);
          setBalance(newBalance);
          logger.debug(`Test wallet balance updated from storage event: ${newBalance}`);
        } catch (error) {
          logger.log('Error parsing test wallet balance:', error);
        }
      }
    };

    // Custom function to check localStorage directly (for same-tab updates)
    const checkLocalStorage = () => {
      try {
        const storedBalance = localStorage.getItem('testWalletBalance');
        if (storedBalance) {
          const newBalance = parseInt(storedBalance, 10);
          if (newBalance !== balance) {
            setBalance(newBalance);
            logger.debug(`Test wallet balance updated from polling: ${newBalance}`);
          }
        }
      } catch (error) {
        logger.log('Error checking test wallet balance:', error);
      }
    };

    // Set up interval to poll localStorage for changes (for same-tab updates)
    const interval = setInterval(checkLocalStorage, 2000);
    
    // Listen for storage events (for cross-tab updates)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [balance]);

  // Function to manually update the balance
  const updateBalance = (newBalance: number) => {
    try {
      localStorage.setItem('testWalletBalance', newBalance.toString());
      setBalance(newBalance);
      logger.debug(`Test wallet balance manually updated: ${newBalance}`);
    } catch (error) {
      logger.log('Error updating test wallet balance:', error);
    }
  };

  return { balance, updateBalance };
}