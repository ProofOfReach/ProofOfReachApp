/**
 * Script to test role dropdown functionality
 * 
 * This script can be included in the page with:
 * <script src="/test-role-dropdown.js"></script>
 */
console.log('Test Role Dropdown script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded, creating test panel');
  setTimeout(createTestPanel, 500); // Give a slight delay to ensure everything is loaded
});

// Ensure the script runs even if loaded after page load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Page already loaded, creating test panel immediately');
  setTimeout(createTestPanel, 500);
}

function createTestPanel() {
  console.log('Creating test panel...');
  
  // Check if panel already exists to avoid duplicates
  if (document.getElementById('role-test-panel')) {
    console.log('Test panel already exists, not creating duplicate');
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'role-test-panel';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  container.style.padding = '15px';
  container.style.borderRadius = '8px';
  container.style.color = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '14px';
  container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  container.style.minWidth = '250px';
  
  // Add title
  const title = document.createElement('div');
  title.textContent = 'Role Dropdown Test Panel';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '10px';
  title.style.fontSize = '16px';
  title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
  title.style.paddingBottom = '5px';
  container.appendChild(title);
  
  // Function to set up test roles
  function setupTestRoles(availableRoles) {
    console.log('Setting up test roles:', availableRoles);
    
    // Store in localStorage
    localStorage.setItem('cachedAvailableRoles', JSON.stringify(availableRoles));
    localStorage.setItem('roleCacheTimestamp', Date.now().toString());
    localStorage.setItem('currentRole', availableRoles[0]);
    
    // Update display
    updateStateDisplay();
    
    // Dispatch custom event to notify components
    try {
      const testRoleEvent = new CustomEvent('test-role-update', {
        detail: { roles: availableRoles }
      });
      console.log('Dispatching test-role-update event');
      window.dispatchEvent(testRoleEvent);
      
      // Also create a storage event manually - this is a hack to trigger the storage listener
      // Since localStorage changes in the same window don't trigger storage events
      const storageEvent = new StorageEvent('storage', {
        key: 'cachedAvailableRoles',
        newValue: JSON.stringify(availableRoles),
        url: window.location.href
      });
      console.log('Dispatching synthetic storage event');
      window.dispatchEvent(storageEvent);
      
      // Force immediate refresh by calling a global function if it exists
      if (typeof window.forceRoleRefresh === 'function') {
        window.forceRoleRefresh();
      } else {
        console.log('window.forceRoleRefresh function not found, using manual events only');
      }
    } catch (e) {
      console.error('Error dispatching events:', e);
    }
    
    // Don't reload the page, we're using events instead
    // window.location.reload();
  }
  
  // Add buttons
  function createButton(label, roles) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.margin = '3px';
    button.style.padding = '6px 10px';
    button.style.backgroundColor = '#444';
    button.style.border = '1px solid #666';
    button.style.borderRadius = '4px';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.onclick = () => setupTestRoles(roles);
    
    // Hover effect
    button.onmouseover = () => {
      button.style.backgroundColor = '#555';
    };
    button.onmouseout = () => {
      button.style.backgroundColor = '#444';
    };
    
    return button;
  }
  
  // Create button section
  const buttonSection = document.createElement('div');
  buttonSection.style.display = 'flex';
  buttonSection.style.flexWrap = 'wrap';
  buttonSection.style.gap = '5px';
  buttonSection.style.marginBottom = '10px';
  buttonSection.style.justifyContent = 'center';
  
  // Add buttons for different role combinations
  buttonSection.appendChild(createButton('All Roles', ['user', 'advertiser', 'publisher', 'admin', 'stakeholder']));
  buttonSection.appendChild(createButton('Advertiser Only', ['advertiser']));
  buttonSection.appendChild(createButton('Publisher Only', ['publisher']));
  buttonSection.appendChild(createButton('User Only', ['user']));
  buttonSection.appendChild(createButton('Admin Only', ['admin']));
  
  container.appendChild(buttonSection);
  
  // Add button to toggle test mode
  const toggleButton = document.createElement('button');
  const isTestMode = localStorage.getItem('isTestMode') === 'true';
  toggleButton.textContent = isTestMode ? 'Disable Test Mode' : 'Enable Test Mode';
  toggleButton.style.marginTop = '5px';
  toggleButton.style.padding = '8px 12px';
  toggleButton.style.backgroundColor = isTestMode ? '#c00' : '#393';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '4px';
  toggleButton.style.color = 'white';
  toggleButton.style.width = '100%';
  toggleButton.style.fontWeight = 'bold';
  toggleButton.style.cursor = 'pointer';
  
  toggleButton.onclick = () => {
    const currentMode = localStorage.getItem('isTestMode') === 'true';
    const newMode = !currentMode;
    localStorage.setItem('isTestMode', newMode.toString());
    updateStateDisplay();
    
    // Dispatch custom event to notify components
    try {
      const testModeEvent = new CustomEvent('test-role-update', {
        detail: { testMode: newMode }
      });
      console.log('Dispatching test-role-update event for test mode change');
      window.dispatchEvent(testModeEvent);
      
      // Also create a storage event manually
      const storageEvent = new StorageEvent('storage', {
        key: 'isTestMode',
        newValue: newMode.toString(),
        url: window.location.href
      });
      console.log('Dispatching synthetic storage event for test mode');
      window.dispatchEvent(storageEvent);
      
      // Force immediate refresh by calling a global function if it exists
      if (typeof window.forceRoleRefresh === 'function') {
        window.forceRoleRefresh();
      }
    } catch (e) {
      console.error('Error dispatching test mode events:', e);
    }
  };
  
  container.appendChild(toggleButton);
  
  // Create state display
  const stateInfo = document.createElement('div');
  stateInfo.id = 'role-test-state';
  stateInfo.style.marginTop = '10px';
  stateInfo.style.fontSize = '13px';
  stateInfo.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  stateInfo.style.padding = '10px';
  stateInfo.style.borderRadius = '4px';
  
  function updateStateDisplay() {
    const testMode = localStorage.getItem('isTestMode') === 'true' ? 'Enabled' : 'Disabled';
    const currentRole = localStorage.getItem('currentRole') || 'none';
    let availableRoles = '[]';
    try {
      const rolesJson = localStorage.getItem('cachedAvailableRoles');
      if (rolesJson) {
        availableRoles = rolesJson;
      }
    } catch (e) {
      console.error('Error parsing roles:', e);
    }
    
    stateInfo.innerHTML = `
      <div style="margin-bottom:5px;"><span style="opacity:0.7;">Test Mode:</span> <b>${testMode}</b></div>
      <div style="margin-bottom:5px;"><span style="opacity:0.7;">Current Role:</span> <b>${currentRole}</b></div>
      <div><span style="opacity:0.7;">Available Roles:</span> <b>${availableRoles}</b></div>
    `;
  }
  
  updateStateDisplay();
  container.appendChild(stateInfo);
  
  // Add minimize button
  const minimizeButton = document.createElement('button');
  minimizeButton.textContent = '-';
  minimizeButton.style.position = 'absolute';
  minimizeButton.style.top = '10px';
  minimizeButton.style.right = '10px';
  minimizeButton.style.width = '20px';
  minimizeButton.style.height = '20px';
  minimizeButton.style.padding = '0';
  minimizeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  minimizeButton.style.border = 'none';
  minimizeButton.style.borderRadius = '50%';
  minimizeButton.style.cursor = 'pointer';
  minimizeButton.style.fontSize = '12px';
  minimizeButton.style.lineHeight = '1';
  minimizeButton.style.display = 'flex';
  minimizeButton.style.alignItems = 'center';
  minimizeButton.style.justifyContent = 'center';
  
  let isMinimized = false;
  const childrenToToggle = [buttonSection, toggleButton, stateInfo, title];
  
  minimizeButton.onclick = () => {
    isMinimized = !isMinimized;
    
    if (isMinimized) {
      minimizeButton.textContent = '+';
      childrenToToggle.forEach(el => el.style.display = 'none');
      container.style.padding = '10px';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    } else {
      minimizeButton.textContent = '-';
      childrenToToggle.forEach(el => el.style.display = '');
      title.style.display = 'block';
      buttonSection.style.display = 'flex';
      container.style.padding = '15px';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    }
  };
  
  container.appendChild(minimizeButton);
  
  // Add to body
  document.body.appendChild(container);
  console.log('Test panel created successfully');
  
  // Enable test mode by default for testing
  if (localStorage.getItem('isTestMode') === null) {
    localStorage.setItem('isTestMode', 'true');
    updateStateDisplay();
  }
}