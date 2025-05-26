import { UserRole } from "@/types/role";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useAuth } from '../../hooks/useAuth';
import { useTestWallet } from '../../hooks/useTestWallet';
import TransactionHistory from '../../components/TransactionHistory';
import BitcoinIcon from '../../components/icons/BitcoinIcon';
import BitcoinBadgeIcon from '../../components/icons/BitcoinBadgeIcon';
import CurrencyAmount from '../../components/CurrencyAmount';
import dynamic from 'next/dynamic';

// Load Bitcoin Connect only on client-side to avoid SSR issues
const BitcoinConnectWallet = dynamic(
  () => import('../../components/BitcoinConnectWallet'),
  { ssr: false }
);
import DashboardContainer from '../../components/ui/DashboardContainer';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardCard from '../../components/ui/DashboardCard';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { getDashboardLayout } from '@/utils/layoutHelpers';
import type { NextPageWithLayout } from '../_app';

// Transaction type enum
type TransactionType = 'deposit' | 'withdrawal' | 'payout' | 'refund' | 'fee';

const WalletPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const user = auth?.user;
  const isAuthenticated = !!auth;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawInvoice, setWithdrawInvoice] = useState('');
  const [processing, setProcessing] = useState(false);
  const [enableRealBitcoinConnect, setEnableRealBitcoinConnect] = useState(false);

  // Test wallet functionality
  const { 
    balance: testWalletBalance, 
    updateBalance: updateTestBalance
  } = useTestWallet();
  const isTestMode = true; // Enable test mode for development

  // Fetchers for SWR
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Fetch user balance
  const { 
    data: balanceData, 
    error: balanceError, 
    isLoading: balanceLoading,
    mutate: refreshBalance 
  } = useSWR('/api/wallet', fetcher);

  // Fetch transaction history
  const { 
    data: transactionsData, 
    error: transactionsError, 
    isLoading: transactionsLoading,
    mutate: refreshTransactions 
  } = useSWR('/api/wallet/transactions', fetcher);

  // Handle authentication - allow test mode access
  useEffect(() => {
    if (!isAuthenticated && !isTestMode) {
      router.push('/auth');
    }
  }, [isAuthenticated, isTestMode, router]);

  if (!isAuthenticated && !isTestMode) {
    return <div>Redirecting...</div>;
  }

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'payout': return 'Ad Payout';
      case 'refund': return 'Refund';
      case 'fee': return 'Fee';
      default: return 'Unknown';
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    return <BitcoinBadgeIcon className="h-4 w-4" />;
  };

  return (
    <DashboardContainer>
      <DashboardHeader 
        title="Account Wallet"
      />
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
          {success}
        </div>
      )}
      
      {/* Testing Mode Toggle */}
      {isTestMode && (
        <DashboardCard title="Testing Configuration">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Bitcoin Connect Integration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {enableRealBitcoinConnect 
                  ? "Using real Bitcoin Connect modal (requires wallet)" 
                  : "Using mock wallet (fast testing)"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enableRealBitcoinConnect}
                onChange={(e) => setEnableRealBitcoinConnect(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Real Bitcoin Connect
              </span>
            </label>
          </div>
        </DashboardCard>
      )}

      {/* Modern Bitcoin Connect Wallet */}
      <BitcoinConnectWallet
        balance={isTestMode ? testWalletBalance : (balanceData?.balance ?? 0)}
        isTestMode={isTestMode}
        enableRealBitcoinConnect={enableRealBitcoinConnect}
        onSuccess={(message) => {
          setSuccess(message);
          setError(null);
          refreshBalance();
          refreshTransactions();
        }}
        onError={(message) => {
          setError(message);
          setSuccess(null);
        }}
        onBalanceUpdate={(newBalance) => {
          if (isTestMode) {
            updateTestBalance(newBalance);
          } else {
            refreshBalance();
          }
        }}
      />

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

WalletPage.getLayout = getDashboardLayout;

export default WalletPage;