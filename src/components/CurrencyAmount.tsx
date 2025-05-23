import React from 'react';
import '@/context/CurrencyContext';

interface CurrencyAmountProps {
  // Support both naming conventions (sats and amount) for backwards compatibility
  sats?: number;
  amount?: number;
  showCurrency?: boolean;
  showTooltip?: boolean;
  className?: string;
  convert?: boolean;
}

/**
 * A component that displays currency amounts and handles conversion between BTC and USD
 * This is a completely rewritten version that directly renders the current amount based on context
 */
const CurrencyAmount: React.FC<CurrencyAmountProps> = ({ 
  sats, 
  amount,
  showCurrency = true,
  showTooltip = true,
  className = '',
  convert = true
}) => {
  // Get the currency and conversion function from context
  const { currency, convertSatsToDollars } = useCurrency();
  
  // Use either sats or amount, with sats taking precedence if both are provided
  const value = sats !== undefined ? sats : (amount !== undefined ? amount : 0);

  // Directly render based on the current currency
  if (convert && currency === 'USD') {
    // Convert to USD
    const dollars = convertSatsToDollars(value);
    return (
      <span className={className} title={showTooltip ? `${value.toLocaleString()} sats` : undefined}>
        ${dollars.toFixed(2)}{showCurrency ? ' USD' : ''}
      </span>
    );
  } else {
    // Show as BTC (satoshis)
    return (
      <span className={className}>
        {value.toLocaleString()}{showCurrency ? ' sats' : ''}
      </span>
    );
  }
};

export default CurrencyAmount;