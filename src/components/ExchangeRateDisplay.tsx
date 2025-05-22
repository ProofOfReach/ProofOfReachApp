import React, { useState, useEffect } from 'react';
import { getExchangeRateDisplay, formatLastUpdated } from '../utils/currencyUtils';
import { priceService } from '../services/priceService';

interface ExchangeRateDisplayProps {
  className?: string;
}

const ExchangeRateDisplay: React.FC<ExchangeRateDisplayProps> = ({ className = '' }) => {
  const [exchangeRate, setExchangeRate] = useState<string>('Loading...');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
    // Initial fetch
    fetchExchangeRate();
    
    // Set up refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchExchangeRate = async () => {
    try {
      const rate = await getExchangeRateDisplay();
      setExchangeRate(rate);
      
      const timestamp = priceService.getLastUpdateTimestamp();
      if (timestamp) {
        setLastUpdated(formatLastUpdated(timestamp));
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setExchangeRate('Exchange rate unavailable');
    }
  };
  
  return (
    <div className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <div>{exchangeRate}</div>
      <div>{lastUpdated}</div>
    </div>
  );
};

export default ExchangeRateDisplay;