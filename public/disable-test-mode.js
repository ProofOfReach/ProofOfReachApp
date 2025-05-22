/**
 * This script completely disables test mode
 */
(function() {
  console.log('DISABLING TEST MODE COMPLETELY');
  
  // Remove all test mode related items from localStorage
  localStorage.removeItem('isTestMode');
  localStorage.removeItem('nostr_test_pk');
  localStorage.removeItem('currentTestRole');
  localStorage.removeItem('testModeEnabled');
  
  // Clear cookies related to authentication
  document.cookie = 'nostr_pubkey=; path=/; max-age=0';
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'auth_session=; path=/; max-age=0';
  document.cookie = 'nostr_auth_session=; path=/; max-age=0';
  
  // Force prevent auto-login
  localStorage.setItem('prevent_auto_login', 'true');
  
  console.log('TEST MODE DISABLED. Browser will now reload.');
  
  // Force reload the page
  window.location.reload();
})();