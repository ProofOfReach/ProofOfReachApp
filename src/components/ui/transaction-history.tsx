import React from 'react';
import { cn, formatSats } from '@/lib/utils';
import { Clock, ArrowUpRight, ArrowDownLeft } from 'react-feather';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  className?: string;
  showPagination?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  className,
  showPagination = true
}) => {
  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="text-green-500" size={16} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-red-500" size={16} />;
      case 'payment':
        return <ArrowUpRight className="text-blue-500" size={16} />;
      case 'refund':
        return <ArrowDownLeft className="text-orange-500" size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Transaction History
      </h3>
      
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transactions found
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
                  {getTypeIcon(transaction.type)}
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={cn(
                  'font-mono font-semibold',
                  transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {transaction.amount > 0 ? '+' : ''}{formatSats(Math.abs(transaction.amount))}
                </p>
                
                <span className={cn(
                  'inline-block px-2 py-1 text-xs font-medium rounded-full',
                  getStatusColor(transaction.status)
                )}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {showPagination && transactions.length > 0 && (
        <div className="flex justify-center pt-4">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;