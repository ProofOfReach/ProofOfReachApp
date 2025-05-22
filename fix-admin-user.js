/**
 * Fix Admin User Script
 * This script will fix the contradictions in the admin user setup
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    console.log('=== FIXING ADMIN USER ===');
    
    // Your npub and hex pubkey
    const yourNpub = 'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed';
    const yourHexPubkey = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';
    
    console.log(`Looking for user with npub: ${yourNpub}`);
    console.log(`Hex pubkey: ${yourHexPubkey}`);
    
    // Find all users
    const allUsers = await prisma.user.findMany();
    console.log(`Found ${allUsers.length} users in database`);
    
    // First user - should be your user with hex pubkey
    const hexUser = await prisma.user.findUnique({
      where: { nostrPubkey: yourHexPubkey }
    });
    
    // Second user - with npub
    const npubUser = await prisma.user.findUnique({
      where: { nostrPubkey: yourNpub }
    });
    
    if (hexUser) {
      console.log(`Found user with hex pubkey: ${hexUser.id}`);
      
      // Update to have admin role
      await prisma.user.update({
        where: { id: hexUser.id },
        data: { currentRole: 'admin' }
      });
      
      // Ensure admin role
      await prisma.userRole.upsert({
        where: { id: `${hexUser.id}-admin` },
        update: { isActive: true },
        create: {
          id: `${hexUser.id}-admin`,
          userId: hexUser.id,
          role: 'admin',
          isActive: true,
          isTestRole: false
        }
      });
      
      console.log(`Updated hex user ${hexUser.id} to have admin role`);
      
      // If npub user exists, make it non-admin
      if (npubUser && npubUser.id !== hexUser.id) {
        console.log(`Found separate npub user: ${npubUser.id}`);
        
        // Remove admin role
        await prisma.user.update({
          where: { id: npubUser.id },
          data: { currentRole: 'viewer' }
        });
        
        // Deactivate admin role
        await prisma.userRole.updateMany({
          where: { 
            userId: npubUser.id,
            role: 'admin'
          },
          data: { isActive: false }
        });
        
        console.log(`Removed admin role from npub user ${npubUser.id}`);
      }
    } else {
      console.log('User with hex pubkey not found!');
      
      // If npub user exists, make it admin
      if (npubUser) {
        console.log(`Found npub user: ${npubUser.id}`);
        
        // Update to have admin role
        await prisma.user.update({
          where: { id: npubUser.id },
          data: { currentRole: 'admin' }
        });
        
        // Ensure admin role
        await prisma.userRole.upsert({
          where: { id: `${npubUser.id}-admin` },
          update: { isActive: true },
          create: {
            id: `${npubUser.id}-admin`,
            userId: npubUser.id,
            role: 'admin',
            isActive: true,
            isTestRole: false
          }
        });
        
        console.log(`Updated npub user ${npubUser.id} to have admin role`);
      } else {
        // Create new user
        console.log('Neither hex nor npub user found. Creating new user...');
        
        const newUser = await prisma.user.create({
          data: {
            nostrPubkey: yourHexPubkey,
            currentRole: 'admin',
            isActive: true
          }
        });
        
        // Create admin role
        await prisma.userRole.create({
          data: {
            id: `${newUser.id}-admin`,
            userId: newUser.id,
            role: 'admin',
            isActive: true,
            isTestRole: false
          }
        });
        
        console.log(`Created new user ${newUser.id} with admin role`);
      }
    }
    
    // Now make sure no other users have admin role
    console.log('\nChecking for other admin users...');
    
    const otherAdminUsers = await prisma.user.findMany({
      where: {
        nostrPubkey: { not: { in: [yourHexPubkey, yourNpub] } },
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
    
    console.log('\n=== ADMIN USER FIXED SUCCESSFULLY ===');
    console.log('To use admin access:');
    console.log('1. Open http://localhost:5000/admin-login.html');
    console.log('2. Click "Login as Admin" and then "Force Admin Role"');
    
  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();