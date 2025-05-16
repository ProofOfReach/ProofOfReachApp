/**
 * Client-side script to fix theme and test mode issues
 */
(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Fixing theme and test mode settings...');
    
    // 1. Fix dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedDarkMode = localStorage.getItem('darkMode');

    // Set dark mode to true if user prefers dark or if it was previously set to true
    if (prefersDarkMode || storedDarkMode === 'true') {
      localStorage.setItem('darkMode', 'true');
      document.documentElement.classList.add('dark');
      console.log('Dark mode enabled');
    } else {
      // If dark mode was explicitly set to false, respect that
      if (storedDarkMode === 'false') {
        localStorage.setItem('darkMode', 'false');
        document.documentElement.classList.remove('dark');
        console.log('Dark mode disabled (user preference)');
      } else {
        // Default to dark mode for new users
        localStorage.setItem('darkMode', 'true');
        document.documentElement.classList.add('dark');
        console.log('Dark mode enabled (default for new users)');
      }
    }

    // 2. Fix test mode
    // Check if we're using a test pubkey (starting with pk_test_)
    const pubkeyRegex = /pk_test_/;
    const testModeActivated = false;

    try {
      // Get auth data from localStorage
      const authData = localStorage.getItem('auth');
      if (authData) {
        const auth = JSON.parse(authData);
        
        if (auth && auth.pubkey && pubkeyRegex.test(auth.pubkey)) {
          // If using a test pubkey, ensure test mode is enabled
          localStorage.setItem('isTestMode', 'true');
          console.log('Test mode enabled based on pubkey');
          testModeActivated = true;
        }
      }
    } catch (e) {
      console.error('Error checking auth data:', e);
    }

    // Also check URL for testMode parameter
    if (window.location.search.includes('testMode=true')) {
      localStorage.setItem('isTestMode', 'true');
      console.log('Test mode enabled based on URL parameter');
      testModeActivated = true;
    }

    if (testModeActivated) {
      // Add a visual indicator for test mode
      const testModeIndicator = document.createElement('div');
      testModeIndicator.style.position = 'fixed';
      testModeIndicator.style.top = '0';
      testModeIndicator.style.left = '0';
      testModeIndicator.style.background = 'rgba(255, 200, 0, 0.9)';
      testModeIndicator.style.color = 'black';
      testModeIndicator.style.padding = '4px 8px';
      testModeIndicator.style.fontSize = '11px';
      testModeIndicator.style.fontWeight = 'bold';
      testModeIndicator.style.zIndex = '9999';
      testModeIndicator.textContent = 'TEST MODE';
      document.body.appendChild(testModeIndicator);
    }
  });
})();