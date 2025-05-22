/**
 * Permanent Admin Access Fix
 * 
 * This script provides a reliable solution to admin access problems by:
 * 1. Directly querying the roles-check API to verify admin status
 * 2. Synchronizing the database and frontend role state
 * 3. Setting appropriate localStorage values for role persistence
 * 4. Ensuring admin access remains consistent across sessions
 */

(function() {
  // Configuration
  const ADMIN_PUBKEY = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';
  const DEBUG = true;
  const STORAGE_PREFIX = 'nostr-ads';
  
  // Console logging helper
  const log = (msg, data) => {
    if (DEBUG) {
      if (data) {
        console.log(`[Admin Fix] ${msg}`, data);
      } else {
        console.log(`[Admin Fix] ${msg}`);
      }
    }
  };

  // Check if user is the project owner
  function verifyOwnership() {
    const currentPubkey = getCurrentPubkey();
    
    if (!currentPubkey) {
      log('No pubkey found in local storage');
      return false;
    }
    
    log('Current pubkey:', currentPubkey);
    log('Admin pubkey:', ADMIN_PUBKEY);
    
    return currentPubkey === ADMIN_PUBKEY;
  }
  
  // Get the current pubkey from localStorage
  function getCurrentPubkey() {
    // Try to get it from the auth state
    try {
      const authState = localStorage.getItem(`${STORAGE_PREFIX}:authState`);
      if (authState) {
        const parsed = JSON.parse(authState);
        if (parsed && parsed.pubkey) {
          return parsed.pubkey;
        }
      }
    } catch (e) {
      log('Error parsing auth state:', e);
    }
    
    // Fallback to nostr_real_pk
    return localStorage.getItem('nostr_real_pk');
  }
  
  // Fetch role data from the special diagnostic API
  async function checkRoleStatus() {
    try {
      log('Fetching role status from API...');
      const response = await fetch('/api/auth/roles-check');
      
      if (!response.ok) {
        log(`API response not OK: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      log('Role status data:', data);
      return data;
    } catch (error) {
      log('Error fetching role status:', error);
      return null;
    }
  }
  
  // Fix the role data in localStorage to ensure admin access
  function fixRoleDataInLocalStorage(roleData) {
    try {
      log('Fixing role data in localStorage...');
      
      // Set the current role to admin
      localStorage.setItem(`${STORAGE_PREFIX}:currentRole`, 'admin');
      
      // Ensure admin is in the available roles
      let availableRoles = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:availableRoles`) || '["viewer"]');
      
      if (!availableRoles.includes('admin')) {
        availableRoles.push('admin');
        localStorage.setItem(`${STORAGE_PREFIX}:availableRoles`, JSON.stringify(availableRoles));
      }
      
      // Force refresh flag for contexts to reload
      localStorage.setItem(`${STORAGE_PREFIX}:force_role_refresh`, 'true');
      
      // Also update the auth state if present
      try {
        const authState = localStorage.getItem(`${STORAGE_PREFIX}:authState`);
        if (authState) {
          const parsed = JSON.parse(authState);
          if (parsed) {
            parsed.currentRole = 'admin';
            if (!parsed.availableRoles) {
              parsed.availableRoles = [];
            }
            if (!parsed.availableRoles.includes('admin')) {
              parsed.availableRoles.push('admin');
            }
            localStorage.setItem(`${STORAGE_PREFIX}:authState`, JSON.stringify(parsed));
          }
        }
      } catch (e) {
        log('Error updating auth state:', e);
      }
      
      log('LocalStorage values set successfully');
      return true;
    } catch (error) {
      log('Error fixing role data in localStorage:', error);
      return false;
    }
  }
  
  // Fix roles in the backend via the modernized roles API
  async function fixRolesInBackend() {
    try {
      log('Updating role in backend...');
      const response = await fetch('/api/roles/modernized', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'admin' })
      });
      
      const data = await response.json();
      log('Backend role update response:', data);
      return data.success;
    } catch (error) {
      log('Error updating role in backend:', error);
      return false;
    }
  }
  
  // Main function to fix admin access
  async function fixAdminAccess() {
    log('Starting admin access fix...');
    
    // Step 1: Verify ownership
    if (!verifyOwnership()) {
      log('Not the owner, aborting fix');
      alert('This fix is only available to the project owner.');
      return false;
    }
    
    // Step 2: Check current role status
    const roleStatus = await checkRoleStatus();
    
    if (!roleStatus) {
      log('Could not retrieve role status, aborting');
      alert('Error checking role status. Please make sure you are logged in.');
      return false;
    }
    
    // Check if admin role is detected in database
    if (!roleStatus.adminStatus.adminDetected) {
      log('Admin role not detected in database');
      alert('Admin role not found in database. Please run the server-side fix first.');
      return false;
    }
    
    // Step 3: Fix role data in localStorage
    const localStorageFixed = fixRoleDataInLocalStorage(roleStatus);
    
    if (!localStorageFixed) {
      log('Failed to fix localStorage data');
      alert('Error updating localStorage. Please try again.');
      return false;
    }
    
    // Step 4: Update backend role if needed
    if (roleStatus.user.currentRole !== 'admin') {
      log('Current role is not admin, updating backend...');
      const backendFixed = await fixRolesInBackend();
      
      if (!backendFixed) {
        log('Failed to update backend role');
        alert('Error updating role in backend but localStorage was updated. A page refresh might still work.');
      }
    }
    
    // Step 5: Check if we need to refresh
    if (roleStatus.hasInconsistency || roleStatus.user.currentRole !== 'admin') {
      log('Role inconsistency detected, page refresh recommended');
      if (confirm('Role data has been fixed. Reload the page to apply changes?')) {
        window.location.reload();
        return true;
      }
    } else {
      log('No inconsistencies detected, fix complete');
      alert('Admin access fix complete. You should now have admin access.');
    }
    
    return true;
  }
  
  // Create a visible button for users to click
  function createFixButton() {
    const button = document.createElement('button');
    button.textContent = 'Fix Admin Access (Permanent)';
    button.id = 'fix-admin-button';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.left = '20px';
    button.style.zIndex = '9999';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.padding = '10px 15px';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    
    button.addEventListener('click', async function() {
      button.disabled = true;
      button.textContent = 'Fixing...';
      const result = await fixAdminAccess();
      if (!result) {
        button.disabled = false;
        button.textContent = 'Fix Admin Access (Permanent)';
      } else {
        button.style.backgroundColor = '#2E7D32';
        button.textContent = 'Admin Access Fixed!';
      }
    });
    
    document.body.appendChild(button);
    log('Fix button created');
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFixButton);
  } else {
    createFixButton();
  }
  
  // Expose the fixAdminAccess function for external use
  window.fixAdminAccess = fixAdminAccess;
})();