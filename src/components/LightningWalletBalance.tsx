import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle } from 'react-feather';
import CurrencyAmount from './CurrencyAmount';
import "./context/TestModeContext';
import "./hooks/useTestWallet';

interface LightningWalletBalanceProps {
  compact?: boolean;
  displayBefore?: string;
  displayAfter?: string;
  className?: string;
  // Added to support external balance value
  sats?: number;
  isLoading?: boolean;
  // Skip API call if external balance is provided
  skipFetch?: boolean;
}

const LightningWalletBalance: React.FC<LightningWalletBalanceProps> = ({
  compact = false,
  displayBefore = 'Current Balance: ',
  displayAfter = ' sats',
  className = '',
  sats,
  isLoading: externalIsLoading,
  skipFetch = false
}) => {
  // Get test mode status and wallet balance from our hooks
  const { isTestMode } = useTestMode();
  const { balance: testWalletBalance } = useTestWallet();
  
  // Force the component to update when testWalletBalance changes
  useEffect(() => {
    if (isTestMode) {
      setBalance(testWalletBalance);
    }
  }, [testWalletBalance, isTestMode]);
  
  const [balance, setBalance] = useState<number | null>(sats !== undefined ? sats : null);
  const [isLoading, setIsLoading] = useState(externalIsLoading !== undefined ? externalIsLoading : true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    // Skip fetch if balance was provided externally or skipFetch flag is set
    if (skipFetch || sats !== undefined) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the test wallet balance if in test mode
      if (isTestMode) {
        // Make sure we're getting the latest value from localStorage
        const storedBalance = localStorage.getItem('testWalletBalance');
        const latestBalance = storedBalance ? parseInt(storedBalance, 10) : testWalletBalance;
        
        console.log('Test mode active, using wallet balance:', latestBalance);
        setBalance(latestBalance);
        setIsLoading(false);
        return;
      }

      // Make API call to fetch wallet balance
      const response = await fetch('/api/wallet', {
        headers: {
          'Cache-Control': 'no-cache',
        },
        credentials: 'include'
      });
      
      // Handle 401 by falling back to test mode
      if (response.status === 401) {
        console.log('Unauthorized error when fetching wallet balance, falling back to test balance');
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('isTestMode', 'true');
        }
        // Use the testWalletBalance from our hook instead of a hardcoded value
        setBalance(testWalletBalance);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setBalance(data.balance);
    } catch (err) {
      console.logger.error('Error fetching wallet balance:', err);
      setError('Failed to fetch wallet balance');
      // Set balance to 0 when error occurs - don't use placeholder values
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to update state if external balance changes
  useEffect(() => {
    if (sats !== undefined) {
      setBalance(sats);
    }
  }, [sats]);

  // Effect to update loading state if external loading state changes
  useEffect(() => {
    if (externalIsLoading !== undefined) {
      setIsLoading(externalIsLoading);
    }
  }, [externalIsLoading]);

  useEffect(() => {
    fetchBalance();
  }, [skipFetch]);

  if (compact) {
    return (
      <div 
        className={`flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 ${className}`}
        data-testid="wallet-balance-container"
      >
        <DollarSign className="h-4 w-4 text-green-500 mr-1.5" />
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {isLoading ? (
            <span className="font-medium">Loading wallet balance...</span>
          ) : error ? (
            <>
              <span className="font-medium text-red-500 dark:text-red-400 mr-1">Error: </span>
              <span className="font-medium">{displayBefore}</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                0{displayAfter}
              </span>
            </>
          ) : (
            <>
              <span className="font-medium">{displayBefore}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                <CurrencyAmount sats={balance || 0} showCurrency={false} />
                {displayAfter}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 ${className}`}
      data-testid="wallet-balance-container"
    >
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Lightning Wallet</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-16 bg-gray-50 dark:bg-gray-700 rounded-md animate-pulse">
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading wallet balance...</span>
        </div>
      ) : error ? (
        <div>
          <div className="flex items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-900/30 p-3 rounded-md">
              <DollarSign className="h-6 w-6 text-gray-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{displayBefore}</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                <CurrencyAmount sats={0} showCurrency={false} />
                {displayAfter}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 p-3 rounded-md">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{displayBefore}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              <CurrencyAmount sats={balance || 0} showCurrency={false} />
              {displayAfter}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightningWalletBalance;