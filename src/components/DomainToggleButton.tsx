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
    setIsDev(storedValue === 'true');
  }, []);

  const toggleMode = () => {
    const newValue = !isDev;
    setIsDev(newValue);
    
    // Store the setting in localStorage for client-side components
    localStorage.setItem('SIMULATE_DEV_DOMAIN', String(newValue));
    
    // Also set a cookie for the middleware
    document.cookie = `SIMULATE_DEV_DOMAIN=${String(newValue)}; path=/; max-age=86400`;
    
    // Force a page reload to apply the changes
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMode}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded shadow-lg flex items-center space-x-2"
      >
        <span>
          {isDev ? '🚧 Switch to Production Mode' : '👨‍💻 Switch to Development Mode'}
        </span>
      </button>
    </div>
  );
};

export default DomainToggleButton;