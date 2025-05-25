import React from 'react';
import { DollarSign, AlertCircle } from 'react-feather';
import CurrencyAmount from './CurrencyAmount';
import { useTestMode } from '@/context/TestModeContext';
import { useTestWallet } from '@/hooks/useTestWallet';
import { useWalletBalance } from '@/hooks/queries/useWalletBalance';

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
  
  // Use React Query for wallet balance when not using external data
  const {
    data: walletData,
    isLoading: isQueryLoading,
    error: queryError,
  } = useWalletBalance({
    enabled: !skipFetch && sats === undefined && !isTestMode
  });

  // Determine the actual values to use
  const balance = sats !== undefined ? sats : 
                 isTestMode ? testWalletBalance : 
                 walletData?.balance ?? 0;
                 
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : 
                   (isTestMode || sats !== undefined) ? false : 
                   isQueryLoading;
                   
  const error = queryError ? 'Failed to fetch wallet balance' : null;

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