import React, { useState, useEffect } from 'react';
import.*./context/CurrencyContext';

interface CurrencyWrapperProps {
  children: React.ReactNode;
}

/**
 * A utility component that forces re-renders when currency changes
 * Wrap any component that displays monetary values with this
 */
const CurrencyWrapper: React.FC<CurrencyWrapperProps> = ({ children }) => {
  const { currency } = useCurrency();
  const [updateKey, setUpdateKey] = useState(0);
  
  // Force re-render when currency changes
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [currency]);
  
  // Listen for all possible currency change events
  useEffect(() => {
    const handleCurrencyChange = () => {
      setUpdateKey(prev => prev + 1);
    };
    
    window.addEventListener('currency-preference-changed', handleCurrencyChange);
    window.addEventListener('currency-change', handleCurrencyChange);
    window.addEventListener('currencyUpdated', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);
    
    // Poll for changes in localStorage
    const interval = setInterval(() => {
      const storedCurrency = localStorage.getItem('preferredCurrency');
      if (storedCurrency && (storedCurrency === 'BTC' || storedCurrency === 'USD') && storedCurrency !== currency) {
        setUpdateKey(prev => prev + 1);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('currency-preference-changed', handleCurrencyChange);
      window.removeEventListener('currency-change', handleCurrencyChange);
      window.removeEventListener('currencyUpdated', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
      clearInterval(interval);
    };
  }, [currency]);
  
  // Re-render the children with a new React key when currency changes
  // Using React.Fragment to avoid DOM nesting issues
  return (
    <React.Fragment key={updateKey}>
      {children}
    </React.Fragment>
  );
};

export default CurrencyWrapper;