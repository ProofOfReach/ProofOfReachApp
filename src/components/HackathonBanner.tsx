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
    // Check if we should show the banner based on props or env var
    const shouldShow = isDev || 
                      showBanner || 
                      process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true';
    
    setIsVisible(shouldShow);
  }, [isDev, showBanner]);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 py-1 px-4 text-center text-amber-800">
      <p className="text-sm font-medium">
        🚧 Hackathon Test Mode – Not Production 🚧
      </p>
    </div>
  );
};

export default HackathonBanner;