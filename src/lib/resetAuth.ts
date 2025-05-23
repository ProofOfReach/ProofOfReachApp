/**
 * Complete authentication reset utility
 * 
 * This file contains functions for completely resetting all authentication state
 * in both client-side storage and cookies.
 */

import { logger } from './logger';

/**
 * Completely reset all authentication state
 * This is the nuclear option for when logout is being problematic
 */
export function resetAllAuthState(): void {
  if (typeof window === 'undefined') return;
  
  logger.log('Performing complete authentication reset');
  
  // 1. Clear all localStorage items
  try {
    localStorage.clear();
    logger.log('Cleared localStorage');
  } catch (error) {
    logger.error('Error clearing localStorage:', error);
  }
  
  // 2. Clear all sessionStorage items
  try {
    sessionStorage.clear();
    logger.log('Cleared sessionStorage');
  } catch (error) {
    logger.error('Error clearing sessionStorage:', error);
  }
  
  // 3. Clear all cookies
  try {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    
    logger.log('Cleared all cookies');
  } catch (error) {
    logger.error('Error clearing cookies:', error);
  }
  
  // 4. Set a prevention flag so login page won't auto-redirect
  try {
    localStorage.setItem('prevent_auto_login', 'true');
    logger.log('Set prevent_auto_login flag');
  } catch (error) {
    logger.error('Error setting prevent_auto_login flag:', error);
  }
  
  // 5. Add a timestamp to help prevent caching issues
  const timestamp = Date.now();
  
  // 6. Force a hard redirect to login page
  try {
    window.location.href = `/login?force_logout=true&t=${timestamp}`;
    logger.log('Redirecting to login page with force_logout flag');
  } catch (error) {
    logger.error('Error redirecting to login page:', error);
  }
}

/**
 * Checks if the current page load is after a forced logout
 */
export function isPostForcedLogout(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('force_logout') === 'true';
}