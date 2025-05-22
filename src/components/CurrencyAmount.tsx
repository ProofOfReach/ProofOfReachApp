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
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  
  // Use either sats or amount, with sats taking precedence if both are provided
  const value = sats !== undefined ? sats : (amount !== undefined ? amount : 0);

  // Listen for ALL possible currency change events
  useEffect(() => {
    const handleCurrencyChange = () => {
      // Force re-render when any currency-related event happens
      setDisplayValue(null);
      setForceUpdateCounter(prev => prev + 1);
    };

    // Various events that could indicate a currency change
    window.addEventListener('currency-preference-changed', handleCurrencyChange);
    window.addEventListener('currency-change', handleCurrencyChange);
    window.addEventListener('currencyUpdated', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);
    
    return () => {
      window.removeEventListener('currency-preference-changed', handleCurrencyChange);
      window.removeEventListener('currency-change', handleCurrencyChange);
      window.removeEventListener('currencyUpdated', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  // Force refresh on currency context change
  useEffect(() => {
    setDisplayValue(null);
    setForceUpdateCounter(prev => prev + 1);
  }, [currency]);

  // Check localStorage periodically for changes
  useEffect(() => {
    const checkLocalStorage = () => {
      const savedCurrency = localStorage.getItem('preferredCurrency');
      if (savedCurrency && (savedCurrency === 'BTC' || savedCurrency === 'USD') && savedCurrency !== currency) {
        setForceUpdateCounter(prev => prev + 1);
      }
    };
    
    // Check every second for test mode compatibility
    const interval = setInterval(checkLocalStorage, 1000);
    return () => clearInterval(interval);
  }, [currency]);

  // Direct rendering based on current currency and value
  const renderCurrentValue = () => {
    if (convert && currency === 'USD') {
      const dollars = convertSatsToDollars(value);
      return (
        <span className={className} title={showTooltip ? `${value.toLocaleString()} sats` : undefined}>
          ${dollars.toFixed(2)}{showCurrency ? ' USD' : ''}
        </span>
      );
    } else {
      return (
        <span className={className}>
          {value.toLocaleString()}{showCurrency ? ' sats' : ''}
        </span>
      );
    }
  };

  return renderCurrentValue();
};

export default CurrencyAmount;