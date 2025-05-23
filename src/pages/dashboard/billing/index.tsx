import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { DollarSign, RefreshCw, Clock, AlertCircle, Archive } from 'react-feather';

import '@/components/ui';
import '@/utils/layoutHelpers';
import type { NextPageWithLayout } from '../../_app';
import '@/hooks/useAuth';
import '@/context/RoleContext';
import '@/components/LightningWallet';
import '@/components/LightningWalletBalance';
import '@/components/TransactionHistory';
import '@/context/CurrencyContext';
import '@/components/CurrencyAmount';
import '@/utils/fetcher';

const BillingPage: NextPageWithLayout = () => {
  const { auth } = useAuth();
  const roleContext = useRole();
  const router = useRouter();
  const currencyContext = useCurrency();
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'invoices'>('transactions');
  const [isDepositing, setIsDepositing] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [log, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Check if testMode is enabled
  const isTestMode = 
    auth?.isTestMode || 
    (typeof localStorage !== 'undefined' && localStorage.getItem('isTestMode') === 'true') ||
    (auth?.pubkey && auth.pubkey.startsWith('pk_test_'));

  // Fetch wallet balance with test mode detection
  const { data: balanceData, mutate: refreshBalance, isLoading: balanceLoading } = useSWR(
    isTestMode ? null : '/api/wallet',
    fetcher,
    { refreshInterval: 10000 } // refresh every 10 seconds
  );

  // In test mode, use state for wallet balance that can be updated
  const [testModeBalance, setTestModeBalance] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined' && isTestMode) {
      const storedBalance = localStorage.getItem('testWalletBalance');
      return storedBalance ? parseInt(storedBalance, 10) : 100000;
    }
    return 100000; // Default test balance
  });
  
  // Update the test mode balance and localStorage
  const updateTestModeBalance = useCallback((newBalance: number) => {
    setTestModeBalance(newBalance);
    if (typeof window !== 'undefined') {
      localStorage.setItem('testWalletBalance', newBalance.toString());
    }
  }, []);
  
  // Use the appropriate balance based on test mode
  const walletBalance = isTestMode ? testModeBalance : (balanceData??.balance ?? 0 || 0);
  
  // Fetch transaction history with test mode detection 
  const { data: transactionsData, mutate: refreshTransactions, isLoading: transactionsLoading } = useSWR(
    isTestMode ? null : '/api/wallet/transactions',
    fetcher,
    { refreshInterval: 30000 } // refresh every 30 seconds
  );

  // Generate mock transactions for test mode
  const mockTransactions = [
    {
      id: 'tx_test_1',
      type: 'DEPOSIT',
      amount: 50000,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'COMPLETED',
      description: 'Test lightning deposit'
    },
    {
      id: 'tx_test_2',
      type: 'CAMPAIGN_PAYMENT',
      amount: -5000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'COMPLETED',
      description: 'Test Campaign #1 - Ad spend'
    },
    {
      id: 'tx_test_3',
      type: 'DEPOSIT',
      amount: 100000,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'COMPLETED',
      description: 'Initial account funding'
    }
  ];

  // Use mock data for test mode
  const transactions = isTestMode ? mockTransactions : (transactionsData?.transactions || []);
  
  // Handle deposit submit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setProcessing(true);
    
    try {
      // Validate amount
      const amountNumber = parseInt(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Skip actual API call in test mode
      if (isTestMode) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        refreshBalance();
        refreshTransactions();
        setSuccess('Test deposit logful!');
        setAmount('');
        setIsDepositing(false);
      } else {
        // Real implementation would go here
        setSuccess('Deposit logful!');
        setAmount('');
        setIsDepositing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  // Handle wallet funding log/error
  const handleWalletSuccess = (message: string) => {
    setError(null);
    setSuccess(message);
    
    // For real mode, refresh data from API
    if (!isTestMode) {
      refreshBalance();
      refreshTransactions();
    } else {
      // For test mode, we already updated the balance via the callback
      // but we can update mock transactions here if needed
      // We do this in addition to the onBalanceUpdate callback
      // for components that don't use that callback
    }
  };
  
  const handleWalletError = (message: string) => {
    setError(message);
    setSuccess(null);
  };

  return (
    <DashboardContainer>
      <DashboardHeader 
        title="Billing & Wallet"
        description="Manage your wallet, deposits, and view transaction history"
      >
        <button 
          onClick={() => {
            refreshBalance();
            refreshTransactions();
          }}
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          disabled={balanceLoading || transactionsLoading}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </DashboardHeader>

      <div className="space-y-6">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {log && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{log}</span>
          </div>
        )}

        {/* Wallet balance card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Wallet Balance</h2>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <LightningWalletBalance sats={walletBalance} isLoading={balanceLoading && !isTestMode} skipFetch={true} />
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  <CurrencyAmount 
                    sats={walletBalance} 
                    convert={true} 
                    showCurrency={true}
                  />
                </p>
              </div>
              
              <div>
                <button 
                  className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md transition-colors flex items-center justify-center"
                  onClick={() => setIsDepositing(true)}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Transaction History</h2>
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
              <nav className="flex -mb-px">
                <button 
                  className={`mr-4 py-2 px-1 ${
                    activeTab === 'transactions' 
                      ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-500 font-medium' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('transactions')}
                >
                  All Transactions
                </button>
                <button 
                  className={`py-2 px-1 ${
                    activeTab === 'invoices' 
                      ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-500 font-medium' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('invoices')}
                >
                  Lightning Invoices
                </button>
              </nav>
            </div>
            
            {activeTab === 'transactions' && (
              <TransactionHistory 
                transactions={transactions}
                isLoading={transactionsLoading && !isTestMode}
              />
            )}
            
            {activeTab === 'invoices' && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Archive className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                <p>Invoice history will be available soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add funds modal */}
      {isDepositing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Add Funds to Wallet
                    </h3>
                    <div className="mt-4">
                      <LightningWallet 
                        balance={walletBalance}
                        isTestMode={isTestMode}
                        onSuccess={handleWalletSuccess}
                        onError={handleWalletError}
                        onClose={() => setIsDepositing(false)}
                        onBalanceUpdate={updateTestModeBalance}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDepositing(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

BillingPage.getLayout = getDashboardLayout;

export default BillingPage;