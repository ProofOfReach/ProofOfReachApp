/**
 * Fix for excessive test mode logging
 */
(function() {
  console.log('Fixing test mode log spam...');
  
  // Original console.log function
  const originalLog = console.log;
  
  // Override console.log to filter out test mode messages
  console.log = function(...args) {
    // Check if this is a test mode log message
    const isTestModeLog = args.length > 0 && 
      typeof args[0] === 'string' && 
      args[0].includes('Test mode detected in localStorage');
    
    // Only log if it's not a test mode message or if it's the first one
    if (!isTestModeLog || !window.testModeLogged) {
      originalLog.apply(console, args);
      
      // Mark that we've logged a test mode message
      if (isTestModeLog) {
        window.testModeLogged = true;
        originalLog.apply(console, ['Test mode logs filtered to reduce console spam']);
      }
    }
  };
  
  // Create a button to help disable test mode
  const createDisableTestModeButton = () => {
    const isTestMode = localStorage.getItem('isTestMode') === 'true';
    
    if (isTestMode) {
      const button = document.createElement('button');
      button.textContent = 'Disable Test Mode';
      button.style.position = 'fixed';
      button.style.bottom = '10px';
      button.style.right = '10px';
      button.style.zIndex = '9999';
      button.style.padding = '8px 12px';
      button.style.background = '#ef4444';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      
      button.onclick = () => {
        localStorage.removeItem('isTestMode');
        localStorage.removeItem('nostr_test_pk');
        localStorage.removeItem('currentTestRole');
        localStorage.removeItem('testModeEnabled');
        
        // Clear cookies
        document.cookie = 'nostr_pubkey=; path=/; max-age=0';
        document.cookie = 'auth_token=; path=/; max-age=0';
        
        alert('Test mode disabled. The page will now reload.');
        window.location.reload();
      };
      
      document.body.appendChild(button);
    }
  };
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDisableTestModeButton);
  } else {
    createDisableTestModeButton();
  }
})();