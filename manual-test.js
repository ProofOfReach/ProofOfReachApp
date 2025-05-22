// Direct test script to enable all roles for the current user
async function enableAllRolesDirectly() {
  try {
    console.log('Attempting to enable all roles for current user...');
    
    // First, try the dedicated endpoint
    const response = await fetch('/api/auth/enable-test-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (response.ok) {
      console.log('Successfully enabled all roles via API');
      return true;
    } else {
      console.error('Failed to enable roles via API:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error in enableAllRolesDirectly:', error);
    return false;
  }
}

// Execute the function
enableAllRolesDirectly().then(result => {
  console.log('Enable all roles result:', result ? 'Success' : 'Failed');
});