/**
 * Script to check the admin user status
 * Run with: node scripts/check-admin-user.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_PUBKEY = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';

async function checkAdminUser() {
  try {
    console.log(`Checking admin user with pubkey: ${ADMIN_PUBKEY}`);
    
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: ADMIN_PUBKEY },
      include: { userRoles: true }
    });
    
    if (!user) {
      console.log('User not found in the database!');
      return;
    }
    
    console.log(`\nUser found with ID: ${user.id}`);
    console.log(`Current role: ${user.currentRole || 'none'}`);
    console.log(`Active: ${user.isActive ? 'Yes' : 'No'}`);
    
    // 2. Check user roles
    console.log('\nRoles:');
    if (user.userRoles.length === 0) {
      console.log('No roles assigned');
    } else {
      user.userRoles.forEach(role => {
        console.log(`- ${role.role}: ${role.isActive ? 'Active' : 'Inactive'}${role.isTestRole ? ' (Test)' : ''}`);
      });
    }
    
    // 3. Check for admin role specifically
    const adminRole = user.userRoles.find(r => r.role === 'admin');
    if (!adminRole) {
      console.log('\n⚠️ User does NOT have an admin role record!');
    } else if (!adminRole.isActive) {
      console.log('\n⚠️ User has an admin role record but it is INACTIVE!');
    } else {
      console.log('\n✅ User has an active admin role record');
    }
    
    // 4. Check currentRole setting
    if (user.currentRole !== 'admin') {
      console.log(`\n⚠️ User's currentRole is not set to 'admin' (current: ${user.currentRole || 'none'})`);
    } else {
      console.log('\n✅ User\'s currentRole is set to "admin"');
    }
    
    // 5. Suggest fixes
    console.log('\nFix suggestions:');
    if (!adminRole) {
      console.log('- Create admin role record for this user:');
      console.log(`  await prisma.userRole.create({
    data: {
      id: "${user.id}-admin", 
      userId: "${user.id}", 
      role: "admin", 
      isActive: true
    }
  });`);
    } else if (!adminRole.isActive) {
      console.log('- Activate the admin role:');
      console.log(`  await prisma.userRole.update({
    where: { id: "${user.id}-admin" },
    data: { isActive: true }
  });`);
    }
    
    if (user.currentRole !== 'admin') {
      console.log('- Update user\'s currentRole to admin:');
      console.log(`  await prisma.user.update({
    where: { id: "${user.id}" },
    data: { currentRole: "admin" }
  });`);
    }
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAdminUser();