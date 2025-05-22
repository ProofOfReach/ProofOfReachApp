/**
 * Script to clear role cache
 * 
 * This script handles roles stored in localStorage and refreshes the user's session.
 */

function clearRoleCache() {
  try {
    console.log('Clearing role cache...');
    
    // Get the namespace
    const namespace = 'nostr-ads';
    
    // Clear role-related localStorage items
    const itemsToClear = [
      'currentRole',
      'cachedAvailableRoles',
      'roleCacheTimestamp',
      'isAdmin',
      'isAdvertiser',
      'isPublisher',
      'isDeveloper',
      'isStakeholder',
      'roleObject',
      'roles',
      'testModeState'
    ];
    
    // Clear items with namespace prefix
    itemsToClear.forEach(item => {
      const key = `${namespace}:${item}`;
      if (localStorage.getItem(key)) {
        console.log(`Clearing ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Clear legacy items without namespace
    itemsToClear.forEach(item => {
      if (localStorage.getItem(item)) {
        console.log(`Clearing legacy ${item}`);
        localStorage.removeItem(item);
      }
    });
    
    // Dispatch events to notify listeners
    dispatchEvent(new CustomEvent('system:storage-changed', {
      detail: {
        key: 'cachedAvailableRoles',
        value: null,
        previousValue: localStorage.getItem(`${namespace}:cachedAvailableRoles`),
        storageType: 'localStorage',
        namespace
      }
    }));
    
    console.log('Role cache cleared successfully!');
    console.log('Refreshing session in 2 seconds...');
    
    // Refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('Error clearing role cache:', error);
    return false;
  }
}

// Check if the script is included directly
if (typeof window !== 'undefined') {
  // Create a button to clear cache
  function createClearCacheButton() {
    // Check if button already exists
    if (document.getElementById('clear-cache-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'clear-cache-button';
    button.innerText = 'Clear Role Cache';
    button.style.position = 'fixed';
    button.style.top = '80px';
    button.style.right = '10px';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#3B82F6';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    button.style.zIndex = '9999';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', clearRoleCache);
    
    document.body.appendChild(button);
  }
  
  // Create the button when the DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createClearCacheButton);
  } else {
    createClearCacheButton();
  }
}