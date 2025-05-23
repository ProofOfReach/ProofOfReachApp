import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '@/components/layout/DashboardLayout';
import '@/context/RoleContext';
import '@/hooks/useAuth';
import { Download, CreditCard, Plus, Repeat, Download as DownloadIcon, Search } from 'react-feather';
import '@/components/icons/SatsIcon';
import '@/components/charts';
import '@/utils/chartHelpers';
import '@/components/CurrencyAmount';
import useSWR from 'swr';
import '@/components/TransactionHistory';
import { TransactionType } from '@prisma/client';

// Fetch balance/transactions from the API
const fetcher = (url: string) => fetch(url).then(res => res.json());

const BillingPage: React.FC & { getLayout?: (page: React.ReactElement) => React.ReactElement } = () => {
  const { role } = defaultUseRole();
  const router = useRouter();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<'transactions' | 'invoices'>('transactions');
  const [isDepositing, setIsDepositing] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [log, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Redirect if not in advertiser role
  useEffect(() => {
    if (role !== 'advertiser') {
      router.push(`/dashboard${role !== 'viewer' ? `/${role}` : ''}`);
    }
  }, [role, router]);
  
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
          description: 'Manual deposit from Advertiser billing',
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
  
  // Calculate total deposits and spend
  const totalDeposits = transactionsData?.transactions
    ? transactionsData.transactions
        .filter((tx: any) => tx.type === 'DEPOSIT')
        .reduce((sum: number, tx: any) => sum + tx.amount, 0)
    : 0;
  
  const totalSpend = transactionsData?.transactions
    ? transactionsData.transactions
        .filter((tx: any) => tx.type === 'AD_PAYMENT')
        .reduce((sum: number, tx: any) => sum + tx.amount, 0)
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SatsIcon className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing &amp; Payments</h1>
        </div>
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {log && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
          {log}
        </div>
      )}
      
      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Balance</span>
            <div className="flex items-center">
              {balanceLoading ? (
                <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                  {balanceData?.balance ?? 0 ? (
                    <CurrencyAmount sats={balanceData?.balance ?? 0} />
                  ) : (
                    '0 sats'
                  )}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Deposits</span>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                + <CurrencyAmount sats={totalDeposits} showTooltip={false} />
              </span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Spend</span>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                - <CurrencyAmount sats={totalSpend} showTooltip={false} />
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            onClick={() => {
              setIsDepositing(true);
              setAmount('');
              setError(null);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Funds
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <Repeat className="w-4 h-4 mr-2" />
            Auto-Fund
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Methods
          </button>
        </div>
      </div>
      
      {/* Deposit Form */}
      {isDepositing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deposit Funds</h2>
          <form onSubmit={handleDepositSubmit}>
            <div className="mb-4">
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (sats)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="depositAmount"
                  name="depositAmount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="1"
                  className="focus:ring-orange-500 focus:border-orange-500 block w-full pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="1000"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">sats</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum deposit: 1 sat
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsDepositing(false);
                  setAmount('');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  processing ? 'opacity-70 cursor-not-allowed' : ''
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
                  'Deposit Funds'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Spend Chart */}
      <LineChart
        title="Spending History"
        subtitle="Campaign spend over time"
        data={transactionsData?.transactions
          ?.filter((tx: any) => tx.type === 'AD_PAYMENT')
          ?.map((tx: any) => ({
            date: new Date(tx.createdAt).toLocaleDateString(),
            spend: tx.amount
          })) || []
        }
        dataKeys={[
          { key: 'spend', name: 'Spend (sats)', color: '#F97316' }
        ]}
        xAxisDataKey="date"
        loading={transactionsLoading}
        height={300}
        tooltipFormatter={(value: number, name: string) => {
          // We can't directly use the CurrencyAmount component in tooltips
          // So we'll use the formatSats helper for now
          return [formatSats(value), name];
        }}
      />
      
      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transaction History</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="mt-2 flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'transactions'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'invoices'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'transactions' ? (
            transactionsData?.transactions ? (
              <TransactionHistory 
                transactions={transactionsData.transactions} 
                isLoading={transactionsLoading} 
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No transaction history available.</p>
            )
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Invoice functionality coming soon.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap the page with our layout
BillingPage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default BillingPage;