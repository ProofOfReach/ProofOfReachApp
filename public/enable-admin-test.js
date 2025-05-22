/**
 * Client-side script to enable test mode with admin role
 * Can be included in any page with:
 * <script src="/enable-admin-test.js"></script>
 */

function enableAdminTestMode() {
  try {
    console.log('Enabling admin test mode...');
    
    // First clear any existing values
    localStorage.removeItem('force_role_refresh');
    
    // Enable test mode
    localStorage.setItem('isTestMode', 'true');
    
    // Set the role to admin
    localStorage.setItem('userRole', 'admin');
    
    // Critical: This must be set after the other values
    localStorage.setItem('force_role_refresh', 'true');
    
    // Log for debugging
    console.log('LocalStorage state:');
    console.log('- isTestMode:', localStorage.getItem('isTestMode'));
    console.log('- userRole:', localStorage.getItem('userRole'));
    console.log('- force_role_refresh:', localStorage.getItem('force_role_refresh'));
    
    // Add visual confirmation button
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.bottom = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.backgroundColor = '#4c1d95';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px 15px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    messageDiv.style.zIndex = '9999';
    messageDiv.innerHTML = 'Test mode enabled with admin role!';
    
    // Add a button to navigate to the admin dashboard
    const adminButton = document.createElement('button');
    adminButton.innerText = 'Go to Admin Dashboard';
    adminButton.style.backgroundColor = '#8b5cf6';
    adminButton.style.color = 'white';
    adminButton.style.border = 'none';
    adminButton.style.padding = '5px 10px';
    adminButton.style.marginLeft = '10px';
    adminButton.style.borderRadius = '3px';
    adminButton.style.cursor = 'pointer';
    adminButton.onclick = function() {
      // Use direct location change for most reliable navigation
      window.location.href = '/dashboard/admin';
    };
    
    // Add a button to navigate to the admin role management page
    const roleButton = document.createElement('button');
    roleButton.innerText = 'Go to Role Management';
    roleButton.style.backgroundColor = '#f59e0b';
    roleButton.style.color = 'white';
    roleButton.style.border = 'none';
    roleButton.style.padding = '5px 10px';
    roleButton.style.marginLeft = '10px';
    roleButton.style.borderRadius = '3px';
    roleButton.style.cursor = 'pointer';
    roleButton.onclick = function() {
      // Use direct location change for most reliable navigation
      window.location.href = '/dashboard/admin/role-management';
    };
    
    messageDiv.appendChild(adminButton);
    messageDiv.appendChild(roleButton);
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 8 seconds (longer to give time to click)
    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv);
      }
    }, 8000);
    
    console.log('Admin test mode enabled successfully!');
    
    // Force navigation to admin dashboard after a short delay
    // This is the most reliable way to ensure the role is applied
    setTimeout(() => {
      window.location.href = '/dashboard/admin';
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Error enabling admin test mode:', error);
    return false;
  }
}

// When the script loads, immediately enable admin test mode
enableAdminTestMode();

// Make the function available globally for the browser console
window.enableAdminTestMode = enableAdminTestMode;