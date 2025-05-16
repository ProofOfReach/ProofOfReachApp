import React from 'react';

// This is a simplified mock of the CurrencyAmount component
// It always displays amounts in BTC format for consistent test expectations
const CurrencyAmount: React.FC<{ 
  sats: number;
  className?: string; 
  showTooltip?: boolean;
  inUSD?: boolean;
  convertToUSD?: boolean;
  fallbackText?: string;
  showCurrencyLabel?: boolean;
}> = ({ 
  sats, 
  className = '',
  fallbackText
}) => {
  return (
    <span className={className} data-testid="currency-amount">
      {sats ? `${sats.toLocaleString()} sats` : fallbackText || '0 sats'}
    </span>
  );
};

export default CurrencyAmount;