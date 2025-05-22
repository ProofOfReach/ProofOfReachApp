import React, { useCallback } from 'react';
import { useCurrency, CurrencyType } from '../context/CurrencyContext';

interface CurrencyToggleProps {
  className?: string;
}

const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ className = '' }) => {
  const { currency, setCurrency } = useCurrency();
  
  // Direct currency setter functions with memoization
  const setBTC = useCallback(() => {
    if (currency !== 'BTC') {
      console.log('Setting currency directly to BTC');
      // Force an update by using localStorage directly too
      localStorage.setItem('preferredCurrency', 'BTC');
      // Then use the context function
      setCurrency('BTC');
      
      // Force refresh for components that might not be listening
      if (typeof window !== 'undefined') {
        // Dispatch a custom event to notify all components
        const event = new CustomEvent('currency-change', { 
          detail: { currency: 'BTC' }
        });
        window.dispatchEvent(event);
      }
    }
  }, [currency, setCurrency]);
  
  const setUSD = useCallback(() => {
    if (currency !== 'USD') {
      console.log('Setting currency directly to USD');
      // Force an update by using localStorage directly too
      localStorage.setItem('preferredCurrency', 'USD');
      // Then use the context function
      setCurrency('USD');
      
      // Force refresh for components that might not be listening
      if (typeof window !== 'undefined') {
        // Dispatch a custom event to notify all components
        const event = new CustomEvent('currency-change', { 
          detail: { currency: 'USD' }
        });
        window.dispatchEvent(event);
      }
    }
  }, [currency, setCurrency]);
  
  return (
    <div className={`${className}`}>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Display Currency</div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-1">
        <div className="grid grid-cols-2 gap-1 w-full">
          <button 
            className={`text-center py-1 rounded ${
              currency === 'BTC' 
                ? 'bg-orange-500 text-white font-medium' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={setBTC}
            aria-label={currency === 'BTC' ? 'Currently showing BTC' : 'Switch to BTC'}
            data-testid="btc-currency-button"
          >
            BTC
          </button>
          <button 
            className={`text-center py-1 rounded ${
              currency === 'USD' 
                ? 'bg-green-500 text-white font-medium' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={setUSD}
            aria-label={currency === 'USD' ? 'Currently showing USD' : 'Switch to USD'}
            data-testid="usd-currency-button"
          >
            USD
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyToggle;