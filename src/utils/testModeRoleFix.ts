/**
 * Test Mode Role Fix
 * 
 * This utility ensures test mode users have access to all roles
 * bypassing the complex role system that's currently broken
 */

export function enableTestModeRoles() {
  if (typeof window === 'undefined') return;
  
  // Check if we're in test mode
  const isTestMode = localStorage.getItem('isTestMode') === 'true';
  const hasTestKey = localStorage.getItem('nostr_pubkey')?.startsWith('pk_test_');
  
  if (isTestMode || hasTestKey) {
    console.log('Enabling test mode roles - forcing all roles to be available');
    
    // Set all role flags
    const allRoles = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    
    // Enable all roles in localStorage
    allRoles.forEach(role => {
      localStorage.setItem(`is${role.charAt(0).toUpperCase() + role.slice(1)}`, 'true');
      localStorage.setItem(`test_${role}_role`, 'true');
    });
    
    // Set available roles
    localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
    localStorage.setItem('roleCacheTimestamp', Date.now().toString());
    
    // Set admin as default role for test mode
    localStorage.setItem('userRole', 'admin');
    
    // Force refresh role context
    window.dispatchEvent(new Event('storage'));
    
    return true;
  }
  
  return false;
}

export function isInTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isTestMode = localStorage.getItem('isTestMode') === 'true';
  const hasTestKey = localStorage.getItem('nostr_pubkey')?.startsWith('pk_test_');
  
  return isTestMode || hasTestKey;
}