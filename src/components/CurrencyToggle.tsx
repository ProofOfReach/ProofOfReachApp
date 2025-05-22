import React, { useState, useEffect } from 'react';
import { useCurrency, CurrencyType } from '../context/CurrencyContext';

interface CurrencyToggleProps {
  className?: string;
}

const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ className = '' }) => {
  // We'll maintain our own state to ensure the button visuals update correctly
  const [activeSelection, setActiveSelection] = useState<CurrencyType>('BTC');
  const { currency, setCurrency } = useCurrency();
  
  // Sync with context on mount and when currency changes
  useEffect(() => {
    // Update our internal state to match context
    setActiveSelection(currency);
  }, [currency]);
  
  // Ensure we have the latest value from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency === 'BTC' || savedCurrency === 'USD') {
      setActiveSelection(savedCurrency as CurrencyType);
    }
  }, []);
  
  // Direct handler with simpler implementation
  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    console.log(`Directly switching currency to: ${newCurrency}`);
    
    // Set local state immediately for visual feedback
    setActiveSelection(newCurrency);
    
    // Update localStorage
    localStorage.setItem('preferredCurrency', newCurrency);
    
    // Update context
    setCurrency(newCurrency);
    
    // Broadcast to all components with multiple event types for compatibility
    if (typeof window !== 'undefined') {
      // Legacy event
      const legacyEvent = new CustomEvent('currency-preference-changed', { 
        detail: { currency: newCurrency }
      });
      window.dispatchEvent(legacyEvent);
      
      // Modern event
      const modernEvent = new CustomEvent('currency-change', { 
        detail: { currency: newCurrency }
      });
      window.dispatchEvent(modernEvent);
      
      // Force update all mounted components
      window.dispatchEvent(new Event('storage'));
      
      // Update a timestamp to trigger other listeners
      localStorage.setItem('currencyLastChanged', Date.now().toString());
      
      // Additional force update for test mode compatibility
      if (localStorage.getItem('testModeActive') === 'true') {
        console.log('Applying test mode currency update');
        setTimeout(() => {
          window.dispatchEvent(new Event('currencyUpdated'));
        }, 0);
      }
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Display Currency</div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-1">
        <div className="grid grid-cols-2 gap-1 w-full">
          <button 
            className={`text-center py-1 rounded ${
              activeSelection === 'BTC' 
                ? 'bg-orange-500 text-white font-medium' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={() => handleCurrencyChange('BTC')}
            aria-label={activeSelection === 'BTC' ? 'Currently showing BTC' : 'Switch to BTC'}
            data-testid="btc-currency-button"
          >
            BTC
          </button>
          <button 
            className={`text-center py-1 rounded ${
              activeSelection === 'USD' 
                ? 'bg-green-500 text-white font-medium' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
            onClick={() => handleCurrencyChange('USD')}
            aria-label={activeSelection === 'USD' ? 'Currently showing USD' : 'Switch to USD'}
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