/**
 * Client-side script to directly enable all roles.
 * Can be included in any page with:
 * <script src="/debug-enable-roles.js"></script>
 */

async function enableAllRoles() {
  console.log('Starting role activation process...');
  
  try {
    // Method 1: Try the admin role endpoint directly
    const adminResponse = await fetch('/api/admin/enable-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('Success with admin endpoint:', adminData);
      alert('Roles enabled successfully!');
      return;
    }
    
    console.log('Admin endpoint failed, trying enable-test-roles...');
    
    // Method 2: Try the enable-test-roles endpoint
    const testResponse = await fetch('/api/auth/enable-test-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('Success with test roles endpoint:', testData);
      alert('Roles enabled successfully!');
      return;
    }
    
    console.log('Both endpoints failed, trying update in localStorage...');
    
    // Method 3: Directly modify localStorage as a last resort
    localStorage.setItem('cachedAvailableRoles', JSON.stringify(['user', 'advertiser', 'publisher', 'admin', 'stakeholder']));
    localStorage.setItem('roleCacheTimestamp', Date.now().toString());
    
    console.log('Modified localStorage successfully. Try refreshing the page.');
    alert('Modified role cache in localStorage. Please refresh the page to see if it worked.');
    
  } catch (error) {
    console.error('Error enabling roles:', error);
    alert('Error enabling roles: ' + (error.message || 'Unknown error'));
  }
}

// Create a button that triggers the role activation
function createEnableRolesButton() {
  const button = document.createElement('button');
  button.textContent = 'Enable All Roles (Debug)';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '8px 12px';
  button.style.backgroundColor = '#ff5722';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontWeight = 'bold';
  
  button.addEventListener('click', enableAllRoles);
  
  document.body.appendChild(button);
}

// Add the button when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createEnableRolesButton);
} else {
  createEnableRolesButton();
}