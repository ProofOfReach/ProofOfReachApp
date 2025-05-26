import React from 'react';
import { cn, formatSats } from '@/lib/utils';

interface CurrencyAmountProps {
  amount?: number;
  sats?: number;
  currency?: 'sats' | 'btc' | 'usd';
  className?: string;
  showSymbol?: boolean;
  showTooltip?: boolean;
}

export const CurrencyAmount: React.FC<CurrencyAmountProps> = ({
  amount,
  sats,
  currency = 'sats',
  className,
  showSymbol = true,
  showTooltip = true
}) => {
  // Use sats prop if provided, otherwise use amount
  const finalAmount = sats ?? amount ?? 0;
  const formatAmount = () => {
    switch (currency) {
      case 'sats':
        return formatSats(finalAmount);
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