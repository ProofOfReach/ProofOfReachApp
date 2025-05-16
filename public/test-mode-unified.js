/**
 * Unified Test Mode Utilities
 * 
 * This script consolidates all test mode functionality into a single file.
 * It handles:
 * 1. Log filtering to prevent console spam
 * 2. Dark mode handling
 * 3. Theme consistency
 * 
 * It works with the new TestModeContext and does not use any deprecated functionality.
 */
(function() {
  console.log('Initializing test mode utilities...');
  
  // Original console functions
  const originalLog = console.log;
  
  // Filter test mode log spam
  console.log = function(...args) {
    // Check if this is a test mode log message
    const isTestModeLog = args.length > 0 && 
      typeof args[0] === 'string' && 
      (args[0].includes('Test mode detected in localStorage') || 
       args[0].includes('Test mode skipping API call'));
    
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
  
  // Fix dark mode
  const setDarkMode = () => {
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
  };
  
  // Check if test mode needs to be detected
  const detectTestMode = () => {
    // Don't need to handle this in the script anymore - TestModeContext handles it now
    // This function exists for future compatibility if needed
    console.log('Test mode detection handled by TestModeContext');
  };
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setDarkMode();
      detectTestMode();
    });
  } else {
    setDarkMode();
    detectTestMode();
  }
  
  // Detect test mode on page load
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('testModeEnabled') === 'true') {
    console.log('Test mode detected on page load');
  }
})();