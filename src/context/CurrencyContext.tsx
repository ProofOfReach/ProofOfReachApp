import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyType = 'BTC' | 'USD';

interface CurrencyContextType {
  currency: CurrencyType;
  toggleCurrency: () => void;
  setCurrency: (currency: CurrencyType) => void;
  btcPrice: number | null;
  loading: boolean;
  convertSatsToDollars: (sats: number) => number;
}

const defaultContext: CurrencyContextType = {
  currency: 'BTC',
  toggleCurrency: () => {},
  setCurrency: () => {},
  btcPrice: null,
  loading: true,
  convertSatsToDollars: (sats: number) => 0,
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
        console.error('Error fetching BTC price:', error);
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

  // Load preferred currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency === 'BTC' || savedCurrency === 'USD') {
      setCurrency(savedCurrency);
    }
  }, []);

  // Direct currency setter
  const setCurrencyValue = (newCurrency: CurrencyType) => {
    console.log(`Setting currency to ${newCurrency}`);
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Toggle between BTC and USD
  const toggleCurrency = () => {
    const newCurrency = currency === 'BTC' ? 'USD' : 'BTC';
    console.log(`Toggling currency from ${currency} to ${newCurrency}`);
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Convert satoshis to USD
  const convertSatsToDollars = (sats: number): number => {
    if (!btcPrice) return 0;
    
    // 1 BTC = 100,000,000 sats
    const btc = sats / 100000000;
    return btc * btcPrice;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        toggleCurrency,
        setCurrency: setCurrencyValue,
        btcPrice,
        loading,
        convertSatsToDollars,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;