/**
 * Direct Database Admin Access Script
 * This script uses a direct database update to give ONLY your key admin access
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function forceAdminAccess() {
  try {
    console.log('=== FORCING ADMIN ACCESS FOR YOUR KEY ONLY ===');
    
    // Your public key
    const yourPubkey = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';
    
    // 1. Get your user
    let yourUser = await prisma.user.findUnique({
      where: { nostrPubkey: yourPubkey }
    });
    
    // Create user if not found
    if (!yourUser) {
      console.log('Your user not found. Creating user record...');
      yourUser = await prisma.user.create({
        data: {
          nostrPubkey: yourPubkey,
          currentRole: 'admin',
          isActive: true
        }
      });
    } else {
      // Update user to have admin role
      console.log('Your user found. Updating role to admin...');
      yourUser = await prisma.user.update({
        where: { id: yourUser.id },
        data: { 
          currentRole: 'admin',
          isActive: true
        }
      });
    }
    
    console.log(`User ID: ${yourUser.id}`);
    
    // 2. Ensure admin role for your user
    const adminRoleId = `${yourUser.id}-admin`;
    
    const existingRole = await prisma.userRole.findUnique({
      where: { id: adminRoleId }
    });
    
    if (existingRole) {
      console.log('Admin role found. Ensuring it is active...');
      await prisma.userRole.update({
        where: { id: adminRoleId },
        data: { isActive: true }
      });
    } else {
      console.log('Admin role not found. Creating...');
      await prisma.userRole.create({
        data: {
          id: adminRoleId,
          userId: yourUser.id,
          role: 'admin',
          isActive: true,
          isTestRole: false
        }
      });
    }
    
    // 3. Create an admin override script
    const adminOverrideJs = `
/**
 * Admin Override Script - ONLY for ${yourPubkey}
 * This script forces admin role for user with pubkey: 
 * ${yourPubkey}
 */

(function() {
  console.log('Initializing admin override...');
  
  // Your pubkey
  const YOUR_PUBKEY = '${yourPubkey}';
  
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
    
    // Set legacy admin flag
    localStorage.setItem(\`\${namespace}:isAdmin\`, 'true');
    
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
`;

    // Create admin override script
    fs.writeFileSync(path.join(__dirname, 'public', 'admin-override.js'), adminOverrideJs);
    console.log('Created admin override script at /public/admin-override.js');
    
    // 4. Create a direct login page for your key
    const loginHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Admin Login for ${yourPubkey}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { color: #3B82F6; }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    button {
      background-color: #3B82F6;
      color: white;
      border: none;
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      margin-right: 0.5rem;
    }
    button.red { background-color: #EF4444; }
    button.green { background-color: #10B981; }
    pre { 
      background: #f1f5f9; 
      padding: 1rem; 
      border-radius: 0.25rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .warning {
      background-color: #FFEDD5;
      border-left: 4px solid #F59E0B;
      padding: 1rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <h1>Admin Access for Your Key Only</h1>
  
  <div class="warning">
    This page provides admin access for ONLY your key: <br>
    <code>${yourPubkey}</code>
  </div>
  
  <div class="card">
    <h2>Direct Login</h2>
    <p>This button will log you in with your pubkey and bypass signature:</p>
    <button class="green" onclick="directLogin()">Login as Admin</button>
  </div>
  
  <div class="card">
    <h2>Force Admin Role</h2>
    <p>This will directly force admin role in localStorage and API calls:</p>
    <button onclick="injectAdminOverride()">Force Admin Role</button>
    <button onclick="clearRoleCache()">Clear Role Cache</button>
  </div>
  
  <div class="card">
    <h2>Navigation</h2>
    <p>Go to important pages:</p>
    <button onclick="window.location.href='/dashboard'">Dashboard</button>
    <button onclick="window.location.href='/dashboard/admin'">Admin Panel</button>
    <button onclick="window.location.href='/dashboard/settings'">Settings</button>
  </div>
  
  <div class="card">
    <h2>Manual Instructions</h2>
    <p>If the buttons don't work, you can manually enable admin mode:</p>
    <ol>
      <li>Open browser developer console (F12)</li>
      <li>Copy and paste this code:</li>
    </ol>
    <pre>// Force admin role
const namespace = 'nostr-ads';
localStorage.setItem(\`\${namespace}:currentRole\`, 'admin');
localStorage.setItem(\`\${namespace}:cachedAvailableRoles\`, JSON.stringify(['viewer', 'admin']));
localStorage.setItem(\`\${namespace}:roleCacheTimestamp\`, Date.now().toString());
localStorage.setItem(\`\${namespace}:isAdmin\`, 'true');
localStorage.setItem(\`\${namespace}:roles\`, JSON.stringify({
  viewer: true, admin: true, advertiser: false, 
  publisher: false, stakeholder: false, developer: false
}));
console.log('Admin role forced');</pre>
  </div>
  
  <script>
    // Clear role cache
    function clearRoleCache() {
      const namespace = 'nostr-ads';
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
      
      // Clear items
      itemsToClear.forEach(item => {
        localStorage.removeItem(\`\${namespace}:\${item}\`);
        localStorage.removeItem(item);
      });
      
      alert('Role cache cleared! Please refresh the page.');
    }
    
    // Inject admin override
    function injectAdminOverride() {
      const script = document.createElement('script');
      script.src = '/admin-override.js';
      document.body.appendChild(script);
      
      // Store pubkey in localStorage
      localStorage.setItem('pubkey', '${yourPubkey}');
      
      alert('Admin override injected! Please refresh the page.');
    }
    
    // Direct login
    function directLogin() {
      // Create a simple POST request to login API
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pubkey: '${yourPubkey}',
          proof: "bypass_signature_" + Date.now()
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Login response:', data);
        if (data.success) {
          // Force admin role
          injectAdminOverride();
          alert('Login successful! Redirecting to dashboard...');
          window.location.href = '/dashboard';
        } else {
          alert('Login failed: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        alert('Login error: ' + error.message);
      });
    }
    
    // Check if already logged in
    function checkLoginStatus() {
      fetch('/api/auth/check')
        .then(response => response.json())
        .then(data => {
          console.log('Login status:', data);
          if (data.isLoggedIn) {
            console.log('Already logged in as:', data.user.pubkey);
            document.body.innerHTML += \`
              <div class="card" style="background-color: #ECFDF5; border-color: #10B981;">
                <h2>Already Logged In</h2>
                <p>You are already logged in as:</p>
                <pre>\${data.user.pubkey}</pre>
                <p>Current role: <strong>\${data.user.currentRole || 'Not set'}</strong></p>
                <button class="green" onclick="injectAdminOverride()">Force Admin Role</button>
                <button onclick="window.location.href='/dashboard'">Go to Dashboard</button>
              </div>
            \`;
          }
        })
        .catch(error => {
          console.error('Error checking login status:', error);
        });
    }
    
    // Check login status on page load
    window.addEventListener('DOMContentLoaded', checkLoginStatus);
  </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(__dirname, 'public', 'admin-login.html'), loginHtml);
    console.log('Created admin login page at /public/admin-login.html');
    
    // 5. Create a simple index.html file to redirect to admin login
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0;url=/admin-login.html">
</head>
<body>
  <p>Redirecting to <a href="/admin-login.html">admin login</a>...</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(__dirname, 'public', 'admin-access.html'), indexHtml);
    console.log('Created redirect page at /public/admin-access.html');
    
    // 6. Check for any other admin users and disable them
    console.log('\nChecking for other admin users...');
    
    const otherAdminUsers = await prisma.user.findMany({
      where: {
        nostrPubkey: { not: yourPubkey },
        currentRole: 'admin'
      }
    });
    
    if (otherAdminUsers.length > 0) {
      console.log(`Found ${otherAdminUsers.length} other admin users. Removing admin role...`);
      
      for (const user of otherAdminUsers) {
        await prisma.user.update({
          where: { id: user.id },
          data: { currentRole: 'viewer' }
        });
        
        // Deactivate admin role
        await prisma.userRole.updateMany({
          where: { 
            userId: user.id,
            role: 'admin'
          },
          data: { isActive: false }
        });
        
        console.log(`Removed admin role from user ${user.id} (${user.nostrPubkey})`);
      }
    } else {
      console.log('No other admin users found.');
    }
    
    console.log('\n=== ADMIN ACCESS CONFIGURED SUCCESSFULLY ===');
    console.log('To use admin access:');
    console.log('1. Open http://localhost:5000/admin-login.html');
    console.log('2. Click "Login as Admin" and then "Force Admin Role"');
    console.log('3. You should now have admin access!');
    
  } catch (error) {
    console.error('Error forcing admin access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceAdminAccess();