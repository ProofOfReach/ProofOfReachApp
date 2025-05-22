import React, { useState, useEffect } from 'react';
import { useCurrency, CurrencyType } from '../context/CurrencyContext';

interface CurrencyToggleProps {
  className?: string;
}

/**
 * Currency toggle component - completely rewritten for simplicity and reliability
 */
const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ className = '' }) => {
  const { currency, setCurrency } = useCurrency();
  
  // Handle BTC selection
  const handleBtcClick = () => {
    if (currency !== 'BTC') {
      setCurrency('BTC');
    }
  };
  
  // Handle USD selection
  const handleUsdClick = () => {
    if (currency !== 'USD') {
      setCurrency('USD');
    }
  };
  
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
            onClick={handleBtcClick}
            aria-label={currency === 'BTC' ? 'Currently showing BTC' : 'Switch to BTC'}
            data-testid="btc-currency-button"
            type="button"
          >
            BTC
          </button>
          <button 
            className={`text-center py-1 rounded ${
              currency === 'USD' 
                ? 'bg-green-500 text-white font-medium' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={handleUsdClick}
            aria-label={currency === 'USD' ? 'Currently showing USD' : 'Switch to USD'}
            data-testid="usd-currency-button"
            type="button"
          >
            USD
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyToggle;