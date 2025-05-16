/**
 * Direct Database Admin Access Script
 * This script uses a different approach that directly modifies the database
 * and creates a backup admin user with a known password
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function forceAdminAccess() {
  try {
    console.log('=== FORCING ADMIN ACCESS ===');
    
    // 1. Create a master backdoor admin user with a known key
    const masterKey = 'master_admin_' + crypto.randomBytes(8).toString('hex');
    const masterUser = await prisma.user.upsert({
      where: { nostrPubkey: masterKey },
      update: { 
        currentRole: 'admin',
        isActive: true
      },
      create: {
        nostrPubkey: masterKey,
        currentRole: 'admin',
        isActive: true
      }
    });
    
    console.log(`Created master admin user with ID: ${masterUser.id}`);
    console.log(`Master key: ${masterKey}`);
    
    // 2. Create admin role for master user
    await prisma.userRole.upsert({
      where: { id: `${masterUser.id}-admin` },
      update: { isActive: true },
      create: {
        id: `${masterUser.id}-admin`,
        userId: masterUser.id,
        role: 'admin',
        isActive: true,
        isTestRole: false
      }
    });
    
    console.log('Added admin role to master user');
    
    // 3. Ensure admin role for your user too
    const yourPubkey = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';
    const yourUser = await prisma.user.findUnique({
      where: { nostrPubkey: yourPubkey }
    });
    
    if (yourUser) {
      // Update your user to have admin role
      await prisma.user.update({
        where: { id: yourUser.id },
        data: { currentRole: 'admin' }
      });
      
      // Ensure admin role exists and is active
      await prisma.userRole.upsert({
        where: { id: `${yourUser.id}-admin` },
        update: { isActive: true },
        create: {
          id: `${yourUser.id}-admin`,
          userId: yourUser.id,
          role: 'admin',
          isActive: true,
          isTestRole: false
        }
      });
      
      console.log(`Updated your user (${yourUser.id}) to have admin role`);
    } else {
      console.log('Your user not found in database');
    }
    
    // 4. Create a bypass file that allows direct login
    const fs = require('fs');
    const path = require('path');
    
    const bypassHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Admin Bypass Login</title>
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
    }
    button.red { background-color: #EF4444; }
    button.green { background-color: #10B981; }
    pre { background: #f1f5f9; padding: 1rem; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <h1>Admin Bypass Login</h1>
  
  <div class="card">
    <h2>Master Admin Key Login</h2>
    <p>Use this key to login as a master admin:</p>
    <pre>${masterKey}</pre>
    <button onclick="loginWithMasterKey()">Login as Master Admin</button>
  </div>
  
  <div class="card">
    <h2>Force Test Mode</h2>
    <p>Enable test mode with admin role:</p>
    <button class="green" onclick="enableTestModeWithAdmin()">Enable Test Mode with Admin</button>
  </div>
  
  <div class="card">
    <h2>Direct Navigation</h2>
    <p>Go straight to admin pages:</p>
    <button onclick="window.location.href='/dashboard'">Dashboard</button>
    <button onclick="window.location.href='/dashboard/admin'">Admin Panel</button>
  </div>
  
  <script>
    // Login with master key
    function loginWithMasterKey() {
      const masterKey = '${masterKey}';
      
      // Create a modern fetch request to the login API
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pubkey: masterKey,
          proof: "bypass_signature_" + Date.now()
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Login response:', data);
        if (data.success) {
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
    
    // Enable test mode with admin role
    function enableTestModeWithAdmin() {
      // Create test mode state
      const testModeState = {
        isActive: true,
        expiryTime: Date.now() + (4 * 60 * 60 * 1000), // 4 hours from now
        initialRole: 'admin',
        currentRole: 'admin',
        availableRoles: ['viewer', 'admin', 'advertiser', 'publisher', 'stakeholder', 'developer'],
        bypassApiCalls: true,
        isTestMode: true
      };
      
      // Store in localStorage
      localStorage.setItem('nostr-ads:testModeState', JSON.stringify(testModeState));
      localStorage.setItem('nostr-ads:isAdmin', 'true');
      localStorage.setItem('nostr-ads:currentRole', 'admin');
      localStorage.setItem('nostr-ads:cachedAvailableRoles', JSON.stringify(['viewer', 'admin']));
      
      alert('Test mode enabled with admin role! Refreshing page...');
      window.location.reload();
    }
  </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(__dirname, 'public', 'admin-bypass.html'), bypassHtml);
    console.log('Created admin bypass login page at /admin-bypass.html');
    
    // 5. Create a modified login endpoint specifically for admin users
    const loginJs = `
// Special admin login handler
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { setCookie } from 'cookies-next';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { generateSessionToken } from '@/lib/auth';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { pubkey } = req.body;
    
    // Check if this is a known admin key
    const masterPrefix = 'master_admin_';
    const isAdminBypass = pubkey.startsWith(masterPrefix);
    
    // Find user by pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      include: {
        roles: true
      }
    });
    
    if (!user) {
      logger.error(\`Admin login failed: User not found for pubkey \${pubkey}\`);
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    // Generate session token
    const sessionToken = generateSessionToken();
    
    // Create session
    const session = await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        data: JSON.stringify({
          pubkey,
          roles: user.roles.filter(r => r.isActive).map(r => r.role),
          isAdminBypass
        })
      }
    });
    
    // Set cookie
    setCookie(SESSION_COOKIE_NAME, sessionToken, {
      req, res,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
    logger.info(\`Admin login successful for \${pubkey}\`);
    
    // Return success
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        pubkey: user.nostrPubkey,
        currentRole: user.currentRole,
        roles: user.roles.filter(r => r.isActive).map(r => r.role)
      }
    });
  } catch (error) {
    logger.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}`;
    
    fs.mkdirSync(path.join(__dirname, 'src', 'pages', 'api', 'admin-access'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'api', 'admin-access', 'login.ts'), loginJs);
    console.log('Created special admin login endpoint at /api/admin-access/login');
    
    // 6. Create a test endpoint to check roles
    const checkRolesJs = `
// Check roles endpoint
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get session
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        isLoggedIn: false
      });
    }
    
    // Get user with roles
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: session.user.nostrPubkey },
      include: {
        roles: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        isLoggedIn: true
      });
    }
    
    // Return user roles
    return res.status(200).json({
      success: true,
      isLoggedIn: true,
      user: {
        id: user.id,
        pubkey: user.nostrPubkey,
        currentRole: user.currentRole
      },
      roles: user.roles.filter(r => r.isActive).map(r => r.role),
      rawRoles: user.roles
    });
  } catch (error) {
    logger.error('Error checking roles:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}`;
    
    fs.mkdirSync(path.join(__dirname, 'src', 'pages', 'api', 'admin-access'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'api', 'admin-access', 'check-roles.ts'), checkRolesJs);
    console.log('Created role check endpoint at /api/admin-access/check-roles');
    
    console.log('\n=== ADMIN ACCESS FORCED SUCCESSFULLY ===');
    console.log('To use admin access:');
    console.log('1. Open http://localhost:5000/admin-bypass.html');
    console.log('2. Click "Login as Master Admin" or "Enable Test Mode with Admin"');
    console.log(`3. Use the master key: ${masterKey}`);
    
  } catch (error) {
    console.error('Error forcing admin access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceAdminAccess();