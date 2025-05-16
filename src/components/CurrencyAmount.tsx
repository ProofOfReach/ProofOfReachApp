import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface CurrencyAmountProps {
  // Support both naming conventions (sats and amount) for backwards compatibility
  sats?: number;
  amount?: number;
  showCurrency?: boolean;
  showTooltip?: boolean;
  className?: string;
  convert?: boolean;
}

const CurrencyAmount: React.FC<CurrencyAmountProps> = ({ 
  sats, 
  amount,
  showCurrency = true,
  showTooltip = true,
  className = '',
  convert = true
}) => {
  const { currency, convertSatsToDollars } = useCurrency();
  
  // Use either sats or amount, with sats taking precedence if both are provided
  const value = sats !== undefined ? sats : (amount !== undefined ? amount : 0);

  // Allow disabling currency conversion even if global setting is USD
  if (convert && currency === 'USD') {
    const dollars = convertSatsToDollars(value);
    return (
      <span className={className} title={showTooltip ? `${value.toLocaleString()} sats` : undefined}>
        ${dollars.toFixed(2)}{showCurrency ? ' USD' : ''}
      </span>
    );
  }

  return (
    <span className={className}>
      {value.toLocaleString()}{showCurrency ? ' sats' : ''}
    </span>
  );
};

export default CurrencyAmount;