import React, { useState, useEffect } from 'react';
import { StorageService } from '@/services/storageService';
import logger from '@/lib/logger';
import { testModeService } from '@/services/testModeService';
import { RoleManager } from '@/services/roleManager';

/**
 * A floating button that appears only for admin users to disable test mode entirely
 * This is a safety measure to ensure test mode can be disabled if it's accidentally
 * showing for regular users
 */
export default function TestModeDisabler() {
  const [showDisabler, setShowDisabler] = useState(false);
  
  useEffect(() => {
    // Only show for admin users
    if (typeof window !== 'undefined') {
      try {
        const currentRole = RoleManager.getCurrentRole();
        if (currentRole === 'admin') {
          setShowDisabler(true);
        }
      } catch (error) {
        logger.error('Error checking admin status for TestModeDisabler:', error);
      }
    }
  }, []);
  
  if (!showDisabler) return null;
  
  const handleDisableTestMode = () => {
    try {
      // Disable test mode using both methods
      testModeService.disableTestMode();
      StorageService.forceDisableTestMode();
      
      // Refresh the page to ensure changes take effect
      window.location.reload();
    } catch (error) {
      logger.error('Error disabling test mode:', error);
      alert('Error disabling test mode. Please try again or check the console.');
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleDisableTestMode}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center space-x-2"
        title="Force disable all test mode banners and features"
        data-testid="test-mode-disabler"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span>Disable Test Mode</span>
      </button>
    </div>
  );
}