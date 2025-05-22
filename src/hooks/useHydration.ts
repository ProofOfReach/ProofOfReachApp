import { useState, useEffect } from 'react';

/**
 * Hook to handle hydration safely
 * 
 * This hook helps prevent hydration mismatches by ensuring components only render
 * their full content after hydration is complete.
 * 
 * @returns boolean indicating if hydration is complete
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  
  // This effect only runs once on the client after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return isHydrated;
}