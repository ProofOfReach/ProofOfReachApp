import React, { ReactNode } from 'react';
import { CurrencyPreference } from '../../utils/currencyUtils';

// Create mock context
export const mockCurrencyContext = {
  currency: 'BTC' as CurrencyPreference,
  setCurrency: jest.fn(),
  toggleCurrency: jest.fn(),
};

// Mock the useCurrency hook
export const useCurrency = jest.fn().mockReturnValue(mockCurrencyContext);

// Mock provider that uses fixed BTC currency for tests
export const MockCurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};