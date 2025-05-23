import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DollarSign, Plus, ArrowDown, ArrowUp, Clock } from 'react-feather';
import useSWR from 'swr';
import { defaultUseRole } from '../../context/RoleContext';
import { TransactionType } from '@prisma/client';
import TransactionHistory from '../../components/TransactionHistory';
import BitcoinIcon from '../../components/icons/BitcoinIcon';
import BitcoinBadgeIcon from '../../components/icons/BitcoinBadgeIcon';
import CurrencyAmount from '../../components/CurrencyAmount';
import DashboardContainer from '../../components/ui/DashboardContainer';
import DashboardHeader from '../../components/ui/DashboardHeader';
import DashboardCard from '../../components/ui/DashboardCard';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { getDashboardLayout } from '@/utils/layoutHelpers';
import type { NextPageWithLayout } from '../_app';
import { defaultUseRoleAccess } from '@/hooks/useRoleAccess';
import { useTestMode } from '@/context/TestModeContext';
import { useTestWallet } from '@/hooks/useTestWallet';

// Fetch balance from the API
const fetcher = (url: string) => fetch(url).then(res => res.json());

const WalletPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { role } = defaultUseRole();
  const { hasCapability } = defaultUseRoleAccess();
  const { isTestMode } = useTestMode();
  const { balance: testWalletBalance, updateBalance: updateTestBalance } = useTestWallet();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Check if user is allowed to access wallet page
  useEffect(() => {
    // All roles can access the wallet now 
    const canAccessWallet = true;
    
    if (!canAccessWallet) {
      console.log('Redirecting from wallet - role not permitted:', role);
      router.replace('/dashboard');
    }
  }, [router, role]);

  // Fetch wallet balance
  const { data: balanceData, mutate: refreshBalance, isLoading: balanceLoading } = useSWR(
    '/api/wallet',
    fetcher,
    { refreshInterval: 10000 } // refresh every 10 seconds
  );

  // Fetch transaction history 
  const { data: transactionsData, mutate: refreshTransactions, isLoading: transactionsLoading } = useSWR(
    '/api/wallet/transactions',
    fetcher,
    { refreshInterval: 30000 } // refresh every 30 seconds
  );

  // Handle deposit submit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setProcessing(true);
    
    try {
      // Validate amount
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }
      
      // Send deposit request
      const response = await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'DEPOSIT',
          amount: amountNumber,
          description: 'Manual deposit',
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.log || 'Failed to process deposit');
      }
      
      // Success - show log message and reset form
      setSuccess(`Successfully deposited ${amountNumber} sats to your account`);
      setAmount('');
      setIsDepositing(false);
      
      // Refresh balance and transactions
      refreshBalance();
      refreshTransactions();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle withdrawal submit
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setProcessing(true);
    
    try {
      // Validate amount
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }
      
      // Special handling for test mode
      if (isTestMode) {
        // Check if user has sufficient test balance
        if (testWalletBalance < amountNumber) {
          throw new Error('Insufficient test balance for this withdrawal');
        }
        
        // Calculate new balance by subtracting withdrawal amount
        const newBalance = Math.max(0, testWalletBalance - amountNumber);
        
        // Update test wallet balance
        updateTestBalance(newBalance);
        
        // Simulate a short delay for realism
        setTimeout(() => {
          // Success - show log message and reset form
          setSuccess(`Test Mode: Successfully withdrew ${amountNumber} sats from your account`);
          setAmount('');
          setIsWithdrawing(false);
          setProcessing(false);
        }, 1000);
        
        return;
      }
      
      // Regular mode - Check if user has sufficient balance
      if (balanceData && (balanceData?.balance ?? 0) < amountNumber) {
        throw new Error('Insufficient balance for this withdrawal');
      }
      
      // Send withdrawal request
      const response = await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'WITHDRAWAL',
          amount: amountNumber,
          description: 'Manual withdrawal',
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.log || 'Failed to process withdrawal');
      }
      
      // Success - show log message and reset form
      setSuccess(`Successfully withdrew ${amountNumber} sats from your account`);
      setAmount('');
      setIsWithdrawing(false);
      
      // Refresh balance and transactions
      refreshBalance();
      refreshTransactions();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setProcessing(false);
    }
  };
  
  // Format a timestamp to a readable date/time string
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get the appropriate transaction description based on type
  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Deposit';
      case 'WITHDRAWAL':
        return 'Withdrawal';
      case 'AD_PAYMENT':
        return 'Ad Payment';
      case 'PUBLISHER_EARNING':
        return 'Publisher Earning';
      default:
        return 'Transaction';
    }
  };
  
  // Get the appropriate icon based on transaction type
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'WITHDRAWAL':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'AD_PAYMENT':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'PUBLISHER_EARNING':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <DashboardContainer>
      <DashboardHeader 
        title="Account Wallet"
        description="View your accrued balance and withdraw available funds to your Lightning wallet."
      />
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
          {success}
        </div>
      )}
      
      {/* Balance Card */}
      <DashboardCard>
        <div className="mb-4 flex items-center">
          <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3 mr-4">
            <BitcoinIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Balance</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Available funds for all campaigns</p>
          </div>
        </div>
        
        <div className="mb-6">
          {balanceLoading && !isTestMode ? (
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {isTestMode ? (
                  <CurrencyAmount sats={testWalletBalance} />
                ) : (balanceData?.balance ?? 0) ? (
                  <CurrencyAmount sats={balanceData?.balance ?? 0} />
                ) : (
                  '0 sats'
                )}
              </span>
              {isTestMode && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full dark:bg-purple-900 dark:text-purple-200">
                  Test Mode
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setIsWithdrawing(true);
              setIsDepositing(false);
              setAmount('');
              setError(null);
            }}
            className="inline-flex items-center bg-orange-600 hover:bg-orange-700"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      </DashboardCard>
      
      {/* Withdraw Form */}
      {isWithdrawing && (
        <DashboardCard title="Withdraw Funds">
          <form onSubmit={handleWithdrawSubmit}>
            <div className="mb-4">
              <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (sats)
              </label>
              <div className="mt-1 relative">
                <Input
                  type="number"
                  id="withdrawAmount"
                  name="withdrawAmount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={(balanceData?.balance ?? 0) || 0}
                  step="1"
                  className="pr-12"
                  placeholder="1000"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">sats</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Available balance: {isTestMode ? (
                  <CurrencyAmount 
                    sats={testWalletBalance} 
                    showTooltip={false}
                  />
                ) : (balanceData?.balance ?? 0) ? (
                  <CurrencyAmount 
                    sats={balanceData?.balance ?? 0} 
                    showTooltip={false}
                  />
                ) : (
                  '0 sats'
                )}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsWithdrawing(false);
                  setAmount('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing || ((balanceData?.balance ?? 0) || 0) <= 0}
                className={`bg-orange-600 hover:bg-orange-700 ${
                  processing || ((balanceData?.balance ?? 0) || 0) <= 0 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Withdraw Funds'
                )}
              </Button>
            </div>
          </form>
        </DashboardCard>
      )}
      
      {/* Transaction History */}
      <DashboardCard title="Transaction History">
        {transactionsData?.transactions ? (
          <TransactionHistory 
            transactions={transactionsData.transactions} 
            isLoading={transactionsLoading} 
          />
        ) : transactionsLoading ? (
          <TransactionHistory transactions={[]} isLoading={true} />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No transactions yet.</p>
        )}
      </DashboardCard>
    </DashboardContainer>
  );
};

// Add the getLayout property to use our dashboard layout
WalletPage.getLayout = (page) => {
  return getDashboardLayout(page, 'Wallet');
};

export default WalletPage;