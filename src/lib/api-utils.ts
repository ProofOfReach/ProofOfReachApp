/**
 * API Utilities
 * 
 * This module provides utilities for making API requests with robust error handling
 */

import { logger } from './logger';

// Tracking to prevent repeated error logging
const erroredRequestsCache = new Set<string>();
const ERROR_CACHE_TTL = 5000; // 5 seconds

/**
 * Safe fetch implementation that won't throw uncaught network errors
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The response or null if the request failed
 */
export const safeFetch = async (url: UserRole, options: RequestInit = {}): Promise<Response | null> => {
  const cacheKey = `${options.method || 'GET'}-${url}`;
  
  try {
    // Set a timeout for the fetch request
    const controller = new AbortController();
    
    // Merge with existing signal if there is one
    const signal = options.signal || controller.signal;
    
    // Set a reasonable timeout
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      ...options,
      signal,
    });
    
    clearTimeout(timeoutId);
    
    // Clear this URL from error cache since it's now working
    if (erroredRequestsCache.has(cacheKey)) {
      erroredRequestsCache.delete(cacheKey);
    }
    
    return response;
  } catch (error) {
    // Only log the error if we haven't recently logged it
    // This prevents console spam from repeated failures
    if (!erroredRequestsCache.has(cacheKey)) {
      logger.log(`Network error during fetch to ${url}:`, error);
      
      // Add to error cache and set up automatic removal
      erroredRequestsCache.add(cacheKey);
      setTimeout(() => {
        erroredRequestsCache.delete(cacheKey);
      }, ERROR_CACHE_TTL);
    }
    
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
export const safeJsonFetch = async <T>(url: UserRole, options: RequestInit = {}): Promise<T | null> => {
  try {
    const response = await safeFetch(url, options);
    
    if (!response) {
      return null;
    }
    
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        logger.log(`API error from ${url}:`, errorData);
      } catch {
        logger.log(`API error from ${url}, status: ${response.status}`);
      }
      return null;
    }
    
    // Handle no content responses
    if (response.status === 204) {
      return null;
    }
    
    return await response.json() as T;
  } catch (error) {
    const cacheKey = `${options.method || 'GET'}-${url}-json`;
    
    // Only log parse errors if we haven't recently logged them
    if (!erroredRequestsCache.has(cacheKey)) {
      logger.log(`Error parsing JSON from ${url}:`, error);
      
      // Add to error cache and set up automatic removal
      erroredRequestsCache.add(cacheKey);
      setTimeout(() => {
        erroredRequestsCache.delete(cacheKey);
      }, ERROR_CACHE_TTL);
    }
    
    return null;
  }
};