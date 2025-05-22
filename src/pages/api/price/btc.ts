import { NextApiRequest, NextApiResponse } from 'next';

// Types
interface PriceResponse {
  price: number;
  timestamp: number;
}

// Cache setup
let cachedPrice: PriceResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if we have a recent cached price
    const now = Date.now();
    if (cachedPrice && now - lastFetchTime < CACHE_DURATION) {
      return res.status(200).json(cachedPrice);
    }

    // Fetch BTC price from Coingecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch BTC price from Coingecko');
    }

    const data = await response.json();
    
    // Extract BTC price in USD
    const price = data.bitcoin.usd;
    
    // Update cache
    cachedPrice = {
      price,
      timestamp: now,
    };
    lastFetchTime = now;

    // Return the price data
    return res.status(200).json(cachedPrice);
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    
    // If we have any cached data, return it even if it's stale
    if (cachedPrice) {
      return res.status(200).json({
        ...cachedPrice,
        stale: true,
      });
    }
    
    // Fallback price if we can't get real data
    return res.status(200).json({
      price: 50000, // Fallback BTC price in USD
      timestamp: Date.now(),
      estimated: true,
    });
  }
}