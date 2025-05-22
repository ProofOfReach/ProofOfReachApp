/**
 * Script to grant admin access to the project owner
 * Run with: node scripts/grant-admin-access.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Project owner's pubkey
const ADMIN_PUBKEY = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';

async function grantAdminAccess() {
  try {
    console.log(`Granting admin access to pubkey: ${ADMIN_PUBKEY}`);
    
    // 1. Get user ID
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: ADMIN_PUBKEY }
    });
    
    if (!user) {
      console.log('Error: User not found in the database!');
      return;
    }
    
    console.log(`Found user with ID: ${user.id}`);
    
    // 2. Create admin role
    const adminRole = await prisma.userRole.upsert({
      where: { id: `${user.id}-admin` },
      update: { isActive: true },
      create: {
        id: `${user.id}-admin`,
        userId: user.id,
        role: 'admin',
        isActive: true,
        isTestRole: false
      }
    });
    
    console.log(`Admin role ${adminRole.id} created/updated successfully.`);
    
    // 3. Update user's currentRole
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        currentRole: 'admin',
        lastRoleChange: new Date()
      }
    });
    
    console.log(`User currentRole updated to: ${updatedUser.currentRole}`);
    
    console.log('\n✅ Admin access granted successfully!');
    console.log('You should now be able to access admin features.');
    
  } catch (error) {
    console.error('Error granting admin access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
grantAdminAccess();