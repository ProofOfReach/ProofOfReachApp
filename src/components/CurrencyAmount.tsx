import React, { useState, useEffect } from 'react';
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
  const { currency, convertSatsToDollars, btcPrice } = useCurrency();
  const [displayValue, setDisplayValue] = useState<React.ReactElement | null>(null);
  
  // Use either sats or amount, with sats taking precedence if both are provided
  const value = sats !== undefined ? sats : (amount !== undefined ? amount : 0);

  // Listen for custom currency change events
  useEffect(() => {
    const handleCurrencyChange = () => {
      // Force re-render when currency changes
      setDisplayValue(null);
    };

    // Listen for both event types to ensure compatibility
    window.addEventListener('currency-preference-changed', handleCurrencyChange);
    window.addEventListener('currency-change', handleCurrencyChange);
    
    return () => {
      window.removeEventListener('currency-preference-changed', handleCurrencyChange);
      window.removeEventListener('currency-change', handleCurrencyChange);
    };
  }, []);

  // Force refresh on currency context change
  useEffect(() => {
    setDisplayValue(null);
  }, [currency]);

  // Regenerate display value whenever currency or value changes
  useEffect(() => {
    if (convert && currency === 'USD') {
      const dollars = convertSatsToDollars(value);
      setDisplayValue(
        <span className={className} title={showTooltip ? `${value.toLocaleString()} sats` : undefined}>
          ${dollars.toFixed(2)}{showCurrency ? ' USD' : ''}
        </span>
      );
    } else {
      setDisplayValue(
        <span className={className}>
          {value.toLocaleString()}{showCurrency ? ' sats' : ''}
        </span>
      );
    }
  }, [value, currency, convertSatsToDollars, btcPrice, className, showCurrency, showTooltip, convert]);

  // If display value isn't ready yet, show appropriate placeholder
  if (!displayValue) {
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
  }

  return displayValue;
};

export default CurrencyAmount;