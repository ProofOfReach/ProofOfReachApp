import React from 'react';
import { ArrowDown, ArrowUp, Clock } from 'react-feather';
import { TransactionType } from '@prisma/client';
import CurrencyAmount from './CurrencyAmount';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  status: string;
  createdAt: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, isLoading }) => {
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
  
  // Determine if a transaction affects the balance positively or negatively
  const isPositiveTransaction = (type: TransactionType) => {
    return type === 'DEPOSIT' || type === 'PUBLISHER_EARNING';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center" data-testid="loading-skeleton">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-4 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return <p className="text-gray-600 dark:text-gray-400">No transactions yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="py-4 flex items-start">
          <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-2 mr-4">
            {getTransactionIcon(transaction.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {getTransactionTypeLabel(transaction.type)}
              </p>
              <p className={`text-sm font-medium ${
                isPositiveTransaction(transaction.type)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {isPositiveTransaction(transaction.type) ? '+' : '-'}
                <CurrencyAmount 
                  sats={transaction.amount} 
                  showTooltip={false}
                />
              </p>
            </div>
            <div className="flex justify-between text-xs">
              <p className="text-gray-500 dark:text-gray-400">
                {formatDate(transaction.createdAt)}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Balance: <CurrencyAmount 
                  sats={transaction?.balanceAfter ?? 0} 
                  showTooltip={false}
                />
              </p>
            </div>
            {transaction.description && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                {transaction.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory;