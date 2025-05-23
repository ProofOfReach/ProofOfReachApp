import { priceService } from '../services/priceService';

// Currency preference type definition
export type CurrencyPreference = 'BTC' | 'USD';

/**
 * Format satoshi amount with default options
 * @param sats Amount in satoshis
 * @returns Formatted string (e.g., "10,000")
 */
export function formatSats(sats: number): string {
  return sats.toLocaleString();
}

/**
 * Format USD amount
 * @param usd Amount in USD
 * @returns Formatted string (e.g., "$5.20")
 */
export function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

/**
 * Format satoshi amount with USD equivalent
 * @param sats Amount in satoshis
 * @returns Promise resolving to a formatted string with USD equivalent
 */
export async function formatWithUsd(sats: number): Promise<string> {
  try {
    const usdValue = await priceService.satsToUsd(sats);
    return `${formatSats(sats)} sats (${formatUsd(usdValue)})`;
  } catch (error) {
    console.log('Error formatting with USD:', error);
    return `${formatSats(sats)} sats`;
  }
}

/**
 * Format USD amount with satoshi equivalent
 * @param usd Amount in USD
 * @returns Promise resolving to a formatted string with satoshi equivalent
 */
export async function formatWithSats(usd: number): Promise<string> {
  try {
    const satsValue = await priceService.usdToSats(usd);
    return `${formatUsd(usd)} (${formatSats(Math.round(satsValue))} sats)`;
  } catch (error) {
    console.log('Error formatting with sats:', error);
    return `${formatUsd(usd)}`;
  }
}

/**
 * Display amount based on user preference
 * @param sats Amount in satoshis
 * @param primaryCurrency User's preferred primary currency
 * @returns Promise resolving to a formatted string with the appropriate primary currency
 */
export async function displayAmount(sats: number, primaryCurrency: CurrencyPreference): Promise<string> {
  if (primaryCurrency === 'BTC') {
    return `${formatSats(sats)} sats`;
  } else {
    const usdValue = await priceService.satsToUsd(sats);
    return formatUsd(usdValue);
  }
}

/**
 * Get the current BTC/USD exchange rate formatted as a string
 * @returns Promise resolving to a formatted exchange rate string
 */
export async function getExchangeRateDisplay(): Promise<string> {
  try {
    const btcPrice = await priceService.getBtcPriceUsd();
    return `1 BTC = ${formatUsd(btcPrice)}`;
  } catch (error) {
    console.log('Error getting exchange rate display:', error);
    return 'Exchange rate unavailable';
  }
}

/**
 * Format a timestamp as a readable "Last updated" string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted string (e.g., "Last updated: 5 minutes ago")
 */
export function formatLastUpdated(timestamp: number | null): string {
  if (!timestamp) {
    return 'Never updated';
  }
  
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'Last updated: just now';
  } else if (diffMins === 1) {
    return 'Last updated: 1 minute ago';
  } else if (diffMins < 60) {
    return `Last updated: ${diffMins} minutes ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) {
      return 'Last updated: 1 hour ago';
    } else {
      return `Last updated: ${diffHours} hours ago`;
    }
  }
}