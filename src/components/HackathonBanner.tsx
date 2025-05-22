import React, { useEffect, useState } from 'react';

interface HackathonBannerProps {
  isDev?: boolean;
  showBanner?: boolean;
}

/**
 * Banner component that displays on dev.proofofreach.xyz to indicate this is a hackathon/test version
 */
const HackathonBanner: React.FC<HackathonBannerProps> = ({ 
  isDev = false, 
  showBanner = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // First priority: Check for production environment variable
    if (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true') {
      setIsVisible(false);
      console.log('Banner hidden: production environment detected');
      return;
    }
    
    // Check localStorage explicitly next
    const simulateDev = localStorage.getItem('SIMULATE_DEV_DOMAIN');
    
    // If localStorage explicitly says false, respect that for local testing
    if (simulateDev === 'false') {
      setIsVisible(false);
      console.log('Banner hidden: explicitly set to production mode in localStorage');
      return;
    }
    
    // Otherwise, check all other conditions
    const shouldShow = isDev || 
                      showBanner || 
                      simulateDev === 'true' ||
                      process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true';
    
    setIsVisible(shouldShow);
    
    // Log the reason why the banner is visible or not for debugging
    console.log('Banner visibility status:', {
      isDev,
      showBanner,
      simulateDev,
      envVar: process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true',
      isVisible: shouldShow
    });
  }, [isDev, showBanner]);

  // Listen for changes to the localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = () => {
      const simulateDev = localStorage.getItem('SIMULATE_DEV_DOMAIN');
      if (simulateDev === 'false') {
        setIsVisible(false);
      } else {
        setIsVisible(isDev || showBanner || simulateDev === 'true' || 
                    process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDev, showBanner]);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 py-2 px-4 text-center text-amber-800">
      <p className="text-sm font-medium">
        🚧 Hackathon Test Mode – This is dev.proofofreach.xyz – Not Production 🚧
      </p>
    </div>
  );
};

export default HackathonBanner;