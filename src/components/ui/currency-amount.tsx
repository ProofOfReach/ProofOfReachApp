import React from 'react';
import { cn, formatSats } from '@/lib/utils';

interface CurrencyAmountProps {
  amount: number;
  currency?: 'sats' | 'btc' | 'usd';
  className?: string;
  showSymbol?: boolean;
}

export const CurrencyAmount: React.FC<CurrencyAmountProps> = ({
  amount,
  currency = 'sats',
  className,
  showSymbol = true
}) => {
  const formatAmount = () => {
    switch (currency) {
      case 'sats':
        return formatSats(amount);
      case 'btc':
        return `${(amount / 100000000).toFixed(8)} BTC`;
      case 'usd':
        return `$${amount.toFixed(2)}`;
      default:
        return amount.toString();
    }
  };

  return (
    <span className={cn(
      'font-mono text-sm font-medium',
      'text-orange-600 dark:text-orange-400',
      className
    )}>
      {formatAmount()}
    </span>
  );
};

export default CurrencyAmount;