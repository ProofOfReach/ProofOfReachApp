/**
 * API Utilities
 * 
 * This module provides utilities for making API requests with robust error handling
 */

import { logger } from './logger';

/**
 * Safe fetch implementation that won't throw uncaught network errors
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The response or null if the request failed
 */
export const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response | null> => {
  try {
    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    // Log the error but don't rethrow
    logger.error(`Network error during fetch to ${url}:`, error);
    return null;
  }
};

/**
 * Safely fetch JSON data with error handling
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The parsed JSON data or null if the request failed
 */
export const safeJsonFetch = async <T>(url: string, options: RequestInit = {}): Promise<T | null> => {
  try {
    const response = await safeFetch(url, options);
    
    if (!response || !response.ok) {
      return null;
    }
    
    return await response.json() as T;
  } catch (error) {
    logger.error(`Error parsing JSON from ${url}:`, error);
    return null;
  }
};