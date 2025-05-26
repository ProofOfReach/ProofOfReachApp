import React, { useState, useEffect } from 'react';

/**
 * A button that allows toggling between production and development mode
 * This is for testing domain-specific features within Replit
 */
const DomainToggleButton: React.FC = () => {
  const [isDev, setIsDev] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if we're in dev mode initially
    const storedValue = localStorage.getItem('SIMULATE_DEV_DOMAIN');
    const isDevMode = storedValue === 'true';
    setIsDev(isDevMode);
    
    // Debug the current mode
    console.log('DomainToggleButton - Current mode:', isDevMode ? 'Development' : 'Production');
  }, []);

  const toggleMode = () => {
    const newValue = !isDev;
    setIsDev(newValue);
    
    // Clear any existing cookie first to avoid stale values
    document.cookie = 'SIMULATE_DEV_DOMAIN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Store the setting in localStorage for client-side components
    localStorage.setItem('SIMULATE_DEV_DOMAIN', String(newValue));
    
    // Also set a cookie for the middleware with a longer expiration
    document.cookie = `SIMULATE_DEV_DOMAIN=${String(newValue)}; path=/; max-age=604800; secure; samesite=strict`;
    
    // Log the mode change
    console.log(`Switching to ${newValue ? 'Development' : 'Production'} mode...`);
    
    // Force a page reload to apply the changes
    setTimeout(() => {
      window.location.href = window.location.pathname; // Use href to get a clean reload
    }, 100);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMode}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded shadow-lg flex items-center space-x-2"
        data-testid="domain-toggle-button"
      >
        <span>
          {isDev ? '🚧 Switch to Production Mode' : '👨‍💻 Switch to Development Mode'}
        </span>
      </button>
      <div className="text-xs mt-1 text-center text-white bg-gray-700 bg-opacity-75 rounded px-2 py-1">
        Current: {isDev ? 'Development' : 'Production'}
      </div>
    </div>
  );
};

export default DomainToggleButton;