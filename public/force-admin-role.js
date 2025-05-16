/**
 * Force Admin Role Script
 * 
 * This script will force the admin role in the browser by:
 * 1. Clearing all cached role data
 * 2. Setting cached roles to include admin
 * 3. Setting current role to admin
 * 4. Refreshing the page to apply changes
 */

(function() {
  // Define namespace
  const namespace = 'nostr-ads';
  
  try {
    console.log('Forcing admin role in browser...');
    
    // Clear old role cache
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
    
    // Set admin role in localStorage
    console.log('Setting admin role in localStorage...');
    
    // Set current role
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
    
    // Set legacy admin flag (for backward compatibility)
    localStorage.setItem(`${namespace}:isAdmin`, 'true');
    
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
    
    // Dispatch storage changed event
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: `${namespace}:currentRole`,
        newValue: 'admin',
        storageArea: localStorage
      })
    );
    
    // Custom event for our application
    window.dispatchEvent(
      new CustomEvent('system:storage-changed', {
        detail: {
          key: 'currentRole',
          value: 'admin',
          previousValue: null,
          storageType: 'localStorage',
          namespace
        }
      })
    );
    
    // Same for available roles
    window.dispatchEvent(
      new CustomEvent('system:storage-changed', {
        detail: {
          key: 'cachedAvailableRoles',
          value: ['viewer', 'admin'],
          previousValue: null,
          storageType: 'localStorage',
          namespace
        }
      })
    );
    
    console.log('Admin role forced successfully!');
    console.log('Page will refresh in 2 seconds...');
    
    // Refresh the page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('Error forcing admin role:', error);
  }
})();

// Create a button to force admin role
(function createForceAdminButton() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
  
  function createButton() {
    // Check if button already exists
    if (document.getElementById('force-admin-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'force-admin-button';
    button.innerText = 'Force Admin Role';
    button.style.position = 'fixed';
    button.style.top = '120px';
    button.style.right = '10px';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#10B981';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    button.style.zIndex = '9999';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', function() {
      // Run the script again when button is clicked
      var script = document.createElement('script');
      script.textContent = `(async function fixAdminRole() {
  try {
    console.log('Running admin role fix for npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed');
    
    // Convert npub to hex
    const pubkey = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey }
    });
    
    if (!user) {
      console.error('User not found');
      return;
    }
    
    console.log('User found:');
    console.log('ID:', user.id);
    console.log('Current Role:', user.currentRole);
    
    // Find user's roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id }
    });
    
    console.log('\nRole assignments:');
    userRoles.forEach(role => {
      console.log(`- ${role.role} (Active: ${role.isActive}, Test: ${role.isTestRole})`);
    });
    
    // Check admin role specifically
    const adminRole = userRoles.find(r => r.role === 'admin');
    if (!adminRole) {
      console.log('\nAdmin role NOT found, adding it...');
      
      // Add admin role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'admin',
          isActive: true,
          isTestRole: false
        }
      });
      
      console.log('Admin role added');
    } else if (!adminRole.isActive) {
      console.log('\nAdmin role found but inactive, activating it...');
      
      // Activate the admin role
      await prisma.userRole.update({
        where: { id: adminRole.id },
        data: { isActive: true }
      });
      
      console.log('Admin role activated');
    } else {
      console.log('\nAdmin role is already active');
    }
    
    // Ensure current role is set to admin
    if (user.currentRole !== 'admin') {
      console.log('\nSetting current role to admin...');
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          currentRole: 'admin',
          previousRole: user.currentRole || 'viewer',
          lastRoleChange: new Date()
        }
      });
      
      console.log('Current role updated to admin');
    } else {
      console.log('\nCurrent role is already admin');
    }
    
    // Generate browser fix script
    console.log('\nCreating browser fix scripts...');
    
    // Update the existing force-admin-role.js script
    const scriptContent = `/**
 * Force Admin Role Script
 * 
 * This script will force the admin role in the browser by:
 * 1. Clearing all cached role data
 * 2. Setting cached roles to include admin
 * 3. Setting current role to admin
 * 4. Refreshing the page to apply changes
 */

(function() {
  // Define namespace
  const namespace = 'nostr-ads';
  
  try {
    console.log('Forcing admin role in browser...');
    
    // Clear old role cache
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
      const key = \`\${namespace}:\${item}\`;
      if (localStorage.getItem(key)) {
        console.log(\`Clearing \${key}\`);
        localStorage.removeItem(key);
      }
    });
    
    // Clear legacy items without namespace
    itemsToClear.forEach(item => {
      if (localStorage.getItem(item)) {
        console.log(\`Clearing legacy \${item}\`);
        localStorage.removeItem(item);
      }
    });
    
    // Set admin role in localStorage
    console.log('Setting admin role in localStorage...');
    
    // Set current role
    localStorage.setItem(\`\${namespace}:currentRole\`, 'admin');
    
    // Set available roles
    localStorage.setItem(
      \`\${namespace}:cachedAvailableRoles\`,
      JSON.stringify(['viewer', 'admin'])
    );
    
    // Set timestamp to now
    localStorage.setItem(
      \`\${namespace}:roleCacheTimestamp\`,
      Date.now().toString()
    );
    
    // Set legacy admin flag (for backward compatibility)
    localStorage.setItem(\`\${namespace}:isAdmin\`, 'true');
    
    // Set roles object
    localStorage.setItem(
      \`\${namespace}:roles\`,
      JSON.stringify({
        viewer: true,
        admin: true,
        advertiser: false,
        publisher: false,
        stakeholder: false,
        developer: false
      })
    );
    
    // Dispatch storage changed event
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: \`\${namespace}:currentRole\`,
        newValue: 'admin',
        storageArea: localStorage
      })
    );
    
    // Custom event for our application
    window.dispatchEvent(
      new CustomEvent('system:storage-changed', {
        detail: {
          key: 'currentRole',
          value: 'admin',
          previousValue: null,
          storageType: 'localStorage',
          namespace
        }
      })
    );
    
    // Same for available roles
    window.dispatchEvent(
      new CustomEvent('system:storage-changed', {
        detail: {
          key: 'cachedAvailableRoles',
          value: ['viewer', 'admin'],
          previousValue: null,
          storageType: 'localStorage',
          namespace
        }
      })
    );
    
    console.log('Admin role forced successfully!');
    console.log('Page will refresh in 2 seconds...');
    
    // Refresh the page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('Error forcing admin role:', error);
  }
})();

// Create a button to force admin role
(function createForceAdminButton() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
  
  function createButton() {
    // Check if button already exists
    if (document.getElementById('force-admin-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'force-admin-button';
    button.innerText = 'Force Admin Role';
    button.style.position = 'fixed';
    button.style.top = '120px';
    button.style.right = '10px';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#10B981';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    button.style.zIndex = '9999';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', function() {
      // Run the script again when button is clicked
      var script = document.createElement('script');
      script.textContent = \`(${arguments.callee.toString()})();\`;
      document.body.appendChild(script);
      document.body.removeChild(script);
    });
    
    document.body.appendChild(button);
  }
})();`;
    
    // Update the force-admin-role.js in public folder
    fs.writeFileSync(path.join(__dirname, 'public', 'force-admin-role.js'), scriptContent);
    
    // Create index.html file for quickly testing admin fix
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Role Fix</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 {
      color: #3B82F6;
    }
    .card {
      background-color: #f9fafb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e5e7eb;
    }
    button {
      background-color: #3B82F6;
      color: white;
      border: none;
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    button.danger {
      background-color: #EF4444;
    }
    button.success {
      background-color: #10B981;
    }
    code {
      background-color: #e5e7eb;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: monospace;
    }
    pre {
      background-color: #1f2937;
      color: #e5e7eb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>Admin Role Fix Tools</h1>
  
  <div class="card">
    <h2>Fix Admin Role in Browser</h2>
    <p>This tool fixes admin role recognition in the browser by resetting role cache and setting admin role.</p>
    <button class="success" onclick="forceAdminRole()">Force Admin Role</button>
  </div>
  
  <div class="card">
    <h2>Clear Role Cache</h2>
    <p>This tool clears all role-related data from browser storage and refreshes the page.</p>
    <button class="danger" onclick="clearRoleCache()">Clear Role Cache</button>
  </div>
  
  <div class="card">
    <h2>Current Role Status</h2>
    <div id="role-status">Loading...</div>
    <button onclick="checkRoleStatus()">Check Status</button>
  </div>
  
  <script>
    function forceAdminRole() {
      const script = document.createElement('script');
      script.src = '/force-admin-role.js';
      document.body.appendChild(script);
    }
    
    function clearRoleCache() {
      const script = document.createElement('script');
      script.src = '/clear-role-cache.js';
      document.body.appendChild(script);
    }
    
    function checkRoleStatus() {
      const namespace = 'nostr-ads';
      const statusDiv = document.getElementById('role-status');
      
      const currentRole = localStorage.getItem(\`\${namespace}:currentRole\`);
      const cachedRoles = localStorage.getItem(\`\${namespace}:cachedAvailableRoles\`);
      const timestamp = localStorage.getItem(\`\${namespace}:roleCacheTimestamp\`);
      
      let html = '<h3>Current Browser Role Data</h3>';
      
      if (currentRole) {
        html += \`<p><strong>Current Role:</strong> <code>\${currentRole}</code></p>\`;
      } else {
        html += '<p><strong>Current Role:</strong> <em>Not set</em></p>';
      }
      
      if (cachedRoles) {
        try {
          const roles = JSON.parse(cachedRoles);
          html += '<p><strong>Available Roles:</strong></p><ul>';
          roles.forEach(role => {
            html += \`<li><code>\${role}</code></li>\`;
          });
          html += '</ul>';
        } catch (e) {
          html += \`<p><strong>Available Roles:</strong> <em>Invalid format: \${cachedRoles}</em></p>\`;
        }
      } else {
        html += '<p><strong>Available Roles:</strong> <em>Not set</em></p>';
      }
      
      if (timestamp) {
        const date = new Date(parseInt(timestamp));
        html += \`<p><strong>Cache Timestamp:</strong> <code>\${date.toLocaleString()}</code></p>\`;
      } else {
        html += '<p><strong>Cache Timestamp:</strong> <em>Not set</em></p>';
      }
      
      statusDiv.innerHTML = html;
    }
    
    // Check status on load
    document.addEventListener('DOMContentLoaded', checkRoleStatus);
  </script>
</body>
</html>`;
    
    // Create the admin-fix.html file in public folder
    fs.writeFileSync(path.join(__dirname, 'public', 'admin-fix.html'), htmlContent);
    
    console.log('\nFix scripts created successfully!');
    console.log('1. Open http://localhost:5000/admin-fix.html in your browser');
    console.log('2. Click "Force Admin Role" button to fix admin access');
    console.log('3. If issues persist, try "Clear Role Cache" then "Force Admin Role"');
    
  } catch (error) {
    console.error('Error fixing admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
})();`;
      document.body.appendChild(script);
      document.body.removeChild(script);
    });
    
    document.body.appendChild(button);
  }
})();