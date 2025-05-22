/**
 * Override Provider Script
 * 
 * This script directly overrides the role providers
 * in the application to force admin access.
 */

(function() {
  console.log('Initializing role override...');
  
  // Wait for the app to initialize
  const checkInterval = setInterval(() => {
    if (window.RoleContext && window.RoleContext.Provider) {
      clearInterval(checkInterval);
      performOverride();
    }
  }, 500);
  
  // Maximum time to wait for context - 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    console.warn('Could not find RoleContext to override');
  }, 10000);
  
  function performOverride() {
    try {
      console.log('Found RoleContext, attempting override...');
      
      // Store original provider
      const originalProvider = window.RoleContext.Provider;
      
      // Create our overridden provider
      window.RoleContext.Provider = function(props) {
        // Clone the value
        const newValue = { ...props.value };
        
        // Override roles
        newValue.roles = {
          viewer: true,
          admin: true, 
          advertiser: false,
          publisher: false,
          stakeholder: false,
          developer: false
        };
        
        newValue.currentRole = 'admin';
        newValue.availableRoles = ['viewer', 'admin'];
        
        // If there are methods for checking roles, override them
        if (newValue.hasRole) {
          const originalHasRole = newValue.hasRole;
          newValue.hasRole = function(role) {
            if (role === 'admin') return true;
            return originalHasRole(role);
          };
        }
        
        // Override the loading state
        newValue.loading = false;
        
        // Call original provider with our modified value
        return originalProvider({
          ...props,
          value: newValue
        });
      };
      
      console.log('RoleContext Provider successfully overridden!');
      console.log('Refresh the page to see the admin role applied');
      
      // Add a refresh button
      const button = document.createElement('button');
      button.innerText = 'Refresh Page';
      button.style.position = 'fixed';
      button.style.top = '160px';
      button.style.right = '10px';
      button.style.padding = '8px 12px';
      button.style.backgroundColor = '#3B82F6';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      button.style.zIndex = '9999';
      button.style.cursor = 'pointer';
      
      button.addEventListener('click', () => {
        window.location.reload();
      });
      
      document.body.appendChild(button);
      
    } catch (error) {
      console.error('Error overriding RoleContext:', error);
    }
  }
})();