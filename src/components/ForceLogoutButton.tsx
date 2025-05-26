import React from 'react';

/**
 * Force Logout Button Component (New Implementation)
 * 
 * This component provides a button that navigates to the dedicated system logout
 * page which performs a complete cleanup of all authentication state.
 */
const ForceLogoutButton: React.FC<{
  className?: string;
  buttonText?: string;
}> = ({ 
  className = 'btn-secondary', 
  buttonText = 'Logout' 
}) => {
  const handleForceLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Navigate to the dedicated system logout page
    window.location.href = '/system/logout';
  };
  
  return (
    <button
      onClick={handleForceLogout}
      className={className}
      data-testid="force-logout-button"
    >
      {buttonText}
    </button>
  );
};

export default ForceLogoutButton;