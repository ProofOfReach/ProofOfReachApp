
/**
 * Admin Override Script - ONLY for 832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a
 * This script forces admin role for user with pubkey: 
 * 832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a
 */

(function() {
  console.log('Initializing admin override...');
  
  // Your pubkey
  const YOUR_PUBKEY = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';
  
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Override fetch
  window.fetch = async function(url, options) {
    // Check if this is a roles API call
    if (typeof url === 'string' && url.includes('/api/roles')) {
      console.log('[Admin Override] Intercepting roles API call');
      
      // Get the current user's pubkey from localStorage or session
      const currentPubkey = localStorage.getItem('pubkey') || sessionStorage.getItem('pubkey');
      
      // If this is your pubkey, force admin response
      if (currentPubkey === YOUR_PUBKEY) {
        console.log('[Admin Override] Detected your pubkey, returning admin role');
        
        // Return mocked response
        return new Promise(resolve => {
          resolve({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              roles: {
                viewer: true,
                admin: true,
                advertiser: false,
                publisher: false,
                stakeholder: false,
                developer: false
              },
              availableRoles: ['viewer', 'admin'],
              currentRole: 'admin'
            })
          });
        });
      }
    }
    
    // Otherwise use original fetch
    return originalFetch.apply(this, arguments);
  };
  
  // Set admin role in localStorage
  function forceAdminRole() {
    const namespace = 'nostr-ads';
    
    // Set current role to admin
    localStorage.setItem(`${namespace}:currentRole`, 'admin');
    
    // Set available roles
    localStorage.setItem(
      `${namespace}:cachedAvailableRoles`,
      JSON.stringify(['viewer', 'admin'])
    );
    
    // Set timestamp to now
    localStorage.setItem(
      `${namespace}:roleCacheTimestamp`,
      Date.now().toString()
    );
    
    // Set roles object
    localStorage.setItem(
      `${namespace}:roles`,
      JSON.stringify({
        viewer: true,
        admin: true,
        advertiser: false,
        publisher: false,
        stakeholder: false,
        developer: false
      })
    );
    
    // Set legacy admin flag
    localStorage.setItem(`${namespace}:isAdmin`, 'true');
    
    console.log('[Admin Override] Admin role forced in localStorage');
  }
  
  // Get current pubkey
  function getCurrentPubkey() {
    return localStorage.getItem('pubkey') || 
           sessionStorage.getItem('pubkey') || 
           localStorage.getItem('nostrPubkey') || 
           sessionStorage.getItem('nostrPubkey');
  }
  
  // Check if this is your pubkey
  const currentPubkey = getCurrentPubkey();
  if (currentPubkey === YOUR_PUBKEY) {
    console.log('[Admin Override] Found your pubkey in storage');
    forceAdminRole();
    
    // Create admin badge
    const badge = document.createElement('div');
    badge.innerText = 'ADMIN';
    badge.style.position = 'fixed';
    badge.style.bottom = '10px';
    badge.style.right = '10px';
    badge.style.backgroundColor = '#10B981';
    badge.style.color = 'white';
    badge.style.padding = '5px 10px';
    badge.style.borderRadius = '4px';
    badge.style.fontWeight = 'bold';
    badge.style.zIndex = '9999';
    document.body.appendChild(badge);
  } else {
    console.log('[Admin Override] Not your pubkey, no admin override applied');
  }
})();
