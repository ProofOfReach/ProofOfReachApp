import React from 'react';

/**
 * Emergency Logout Component
 * 
 * This component provides a floating emergency logout button that 
 * can be used when the normal logout functionality isn't working.
 * It directly navigates to the system logout page for a clean reset.
 */
const EmergencyLogout: React.FC = () => {
  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      data-testid="emergency-logout-container"
    >
      <button
        onClick={() => window.location.href = '/system/logout'}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
        title="Emergency Logout"
        data-testid="emergency-logout-button"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
        Emergency Logout
      </button>
    </div>
  );
};

export default EmergencyLogout;