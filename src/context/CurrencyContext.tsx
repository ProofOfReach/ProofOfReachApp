import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type CurrencyType = 'BTC' | 'USD';

// Custom event for currency changes
const CURRENCY_CHANGE_EVENT = 'currency-preference-changed';

interface CurrencyContextType {
  currency: CurrencyType;
  toggleCurrency: () => void;
  setCurrency: (currency: CurrencyType) => void;
  btcPrice: number | null;
  loading: boolean;
  convertSatsToDollars: (sats: number) => number;
  convertDollarsToSats: (dollars: number) => number;
}

const defaultContext: CurrencyContextType = {
  currency: 'BTC',
  toggleCurrency: () => {},
  setCurrency: () => {},
  btcPrice: null,
  loading: true,
  convertSatsToDollars: (sats: number) => 0,
  convertDollarsToSats: (dollars: number) => 0,
};

const CurrencyContext = createContext<CurrencyContextType>(defaultContext);

export const useCurrency = () => useContext(CurrencyContext);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyType>('BTC');
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch BTC price on component mount
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        // Check localStorage for cached price data
        const cachedData = localStorage.getItem('btcPriceData');
        
        if (cachedData) {
          const { price, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          
          // If cache is less than 15 minutes old, use it
          if (cacheAge < 15 * 60 * 1000) {
            console.log('Using localStorage cached BTC price data');
            setBtcPrice(price);
            setLoading(false);
            return;
          }
        }
        
        // Otherwise fetch fresh data
        const response = await fetch('/api/price/btc');
        
        if (!response.ok) {
          throw new Error('Failed to fetch BTC price');
        }
        
        const data = await response.json();
        setBtcPrice(data.price);
        
        // Cache the price data with timestamp
        localStorage.setItem('btcPriceData', JSON.stringify({
          price: data.price,
          timestamp: Date.now()
        }));
        
      } catch (error) {
        console.logger.error('Error fetching BTC price:', error);
        // If fetch fails but we have cached data (regardless of age), use it as fallback
        const cachedData = localStorage.getItem('btcPriceData');
        if (cachedData) {
          const { price } = JSON.parse(cachedData);
          setBtcPrice(price);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBtcPrice();
    
    // Set up a refresh interval (every 15 minutes)
    const interval = setInterval(fetchBtcPrice, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for currency change events (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferredCurrency' && e.newValue) {
        if (e.newValue === 'BTC' || e.newValue === 'USD') {
          console.log(`Currency changed in another tab to ${e.newValue}`);
          setCurrency(e.newValue as CurrencyType);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load preferred currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency === 'BTC' || savedCurrency === 'USD') {
      setCurrency(savedCurrency);
    }
  }, []);

  // Direct currency setter with event dispatch and force re-render
  const setCurrencyValue = useCallback((newCurrency: CurrencyType) => {
    console.log(`Setting currency to ${newCurrency}`);
    
    // Update state
    setCurrency(newCurrency);
    
    // Save to localStorage
    localStorage.setItem('preferredCurrency', newCurrency);
    
    // Generate a unique timestamp for this change
    const timestamp = Date.now();
    
    // Dispatch events to notify all components of the currency change
    if (typeof window !== 'undefined') {
      // Legacy event for backward compatibility
      const legacyEvent = new CustomEvent(CURRENCY_CHANGE_EVENT, { 
        detail: { currency: newCurrency, timestamp }
      });
      window.dispatchEvent(legacyEvent);
      
      // Modern event format
      const modernEvent = new CustomEvent('currency-change', { 
        detail: { currency: newCurrency, timestamp }
      });
      window.dispatchEvent(modernEvent);
      
      // Direct event to force global re-renders
      window.dispatchEvent(new Event('storage'));
      
      // Add timestamp to localStorage for components not listening to events
      localStorage.setItem('currencyLastChanged', timestamp.toString());
      
      // Force page-wide render by updating multiple elements
      document.body.dataset.currency = newCurrency;
      document.documentElement.style.setProperty('--currency-type', newCurrency);
      
      // For test mode compatibility
      if (localStorage.getItem('testModeActive') === 'true') {
        console.log('Applying test mode currency update for:', newCurrency);
        localStorage.setItem('testModeCurrency', newCurrency);
      }
      
      // Force all React components to notice the change
      setTimeout(() => {
        window.dispatchEvent(new Event('currencyUpdated'));
      }, 0);
    }
  }, []);

  // Toggle between BTC and USD
  const toggleCurrency = useCallback(() => {
    const newCurrency = currency === 'BTC' ? 'USD' : 'BTC';
    console.log(`Toggling currency from ${currency} to ${newCurrency}`);
    setCurrencyValue(newCurrency);
  }, [currency, setCurrencyValue]);

  // Convert satoshis to USD
  const convertSatsToDollars = useCallback((sats: number): number => {
    if (!btcPrice || !sats) return 0;
    
    // 1 BTC = 100,000,000 sats
    const btc = sats / 100000000;
    return btc * btcPrice;
  }, [btcPrice]);

  // Convert USD to satoshis
  const convertDollarsToSats = useCallback((dollars: number): number => {
    if (!btcPrice || !dollars) return 0;
    
    // Convert USD to BTC, then to sats
    const btc = dollars / btcPrice;
    return Math.round(btc * 100000000);
  }, [btcPrice]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        toggleCurrency,
        setCurrency: setCurrencyValue,
        btcPrice,
        loading,
        convertSatsToDollars,
        convertDollarsToSats,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// Add a global listener for currency changes
if (typeof window !== 'undefined') {
  window.addEventListener(CURRENCY_CHANGE_EVENT, (e: Event) => {
    console.log('Currency changed globally:', (e as CustomEvent).detail);
  });
}

export default CurrencyContext;