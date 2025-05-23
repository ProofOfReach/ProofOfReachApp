/**
 * Utility functions for handling role-related events across components
 */

// Trigger a role refresh event across all components
export function triggerRoleRefresh() {
  if (typeof window === 'undefined') return;
  
  console.log('Triggering global role refresh...');
  
  // Dispatch a custom event that components can listen for
  const event = new CustomEvent('test-role-update');
  window.dispatchEvent(event);
  
  // Also simulate a storage event for older components
  // that don't listen to the custom event
  if (typeof window.dispatchEvent === 'function') {
    try {
      const storageEvent = new StorageEvent('storage', {
        key: 'cachedAvailableRoles'
      });
      window.dispatchEvent(storageEvent);
    } catch (error) {
      console.logger.error('Error dispatching storage event:', error);
    }
  }
}

// Store available roles in local storage
export function saveAvailableRoles(roles: string[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cachedAvailableRoles', JSON.stringify(roles));
    localStorage.setItem('roleCacheTimestamp', Date.now().toString());
    
    // Trigger refresh to update all components
    triggerRoleRefresh();
  } catch (error) {
    console.logger.error('Error saving available roles to localStorage:', error);
  }
}

// Get available roles from local storage
export function getAvailableRoles(): string[] {
  if (typeof window === 'undefined') return ['viewer'];
  
  try {
    const roles = localStorage.getItem('cachedAvailableRoles');
    if (!roles) return ['viewer'];
    
    return JSON.parse(roles);
  } catch (error) {
    console.logger.error('Error retrieving available roles from localStorage:', error);
    return ['viewer'];
  }
}