/**
 * Check Admin Role Script
 * This script checks admin roles in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminRole() {
  try {
    console.log('=== CHECKING ADMIN ROLES ===');
    
    // Your pubkey 
    const yourPubkey = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';
    
    // Find your user
    const yourUser = await prisma.user.findUnique({
      where: { nostrPubkey: yourPubkey },
      include: {
        userRoles: true
      }
    });
    
    console.log('\n=== USER STATUS ===');
    if (yourUser) {
      console.log(`User found: ${yourUser.id}`);
      console.log(`Current role: ${yourUser.currentRole}`);
      console.log(`Active: ${yourUser.isActive}`);
      console.log(`Roles available: ${yourUser.userRoles.length}`);
      
      yourUser.userRoles.forEach(role => {
        console.log(`- ${role.role} (${role.isActive ? 'ACTIVE' : 'INACTIVE'})`);
      });
      
      // Check admin role
      const adminRole = yourUser.userRoles.find(r => r.role === 'admin');
      if (adminRole) {
        console.log(`\nAdmin role: ${adminRole.id}`);
        console.log(`Active: ${adminRole.isActive}`);
        console.log(`Test role: ${adminRole.isTestRole}`);
      } else {
        console.log('\nAdmin role not found!');
      }
    } else {
      console.log('User not found!');
    }
    
    // Check all admin users
    const adminUsers = await prisma.user.findMany({
      where: { 
        currentRole: 'admin'
      }
    });
    
    console.log('\n=== ALL ADMIN USERS ===');
    console.log(`Found ${adminUsers.length} users with admin role`);
    
    for (const user of adminUsers) {
      console.log(`- ID: ${user.id}, Pubkey: ${user.nostrPubkey}`);
    }
    
    // Check admin roles
    const adminRoles = await prisma.userRole.findMany({
      where: { 
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('\n=== ACTIVE ADMIN ROLES ===');
    console.log(`Found ${adminRoles.length} active admin roles`);
    
    for (const role of adminRoles) {
      console.log(`- ID: ${role.id}, User: ${role.userId}`);
    }
    
  } catch (error) {
    console.error('Error checking admin roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminRole();