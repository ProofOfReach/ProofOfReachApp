/**
 * Grant Admin Access Script
 * 
 * This script ensures the specified Nostr public key has admin access
 * and sets the current role to admin.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function grantAdminAccess(npub, hexPubkey) {
  try {
    console.log(`Granting admin access to ${npub}`);
    console.log(`Hex pubkey: ${hexPubkey}`);
    
    // Find the user
    let user = await prisma.user.findUnique({
      where: { nostrPubkey: hexPubkey }
    });
    
    if (!user) {
      console.log('User not found. Creating new user...');
      user = await prisma.user.create({
        data: {
          nostrPubkey: hexPubkey,
          currentRole: 'admin',
          isActive: true
        }
      });
      console.log('New user created with ID:', user.id);
    } else {
      console.log('User found with ID:', user.id);
    }
    
    // Check if user already has admin role
    const adminRole = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        role: 'admin'
      }
    });
    
    if (adminRole) {
      console.log('Admin role already exists. Ensuring it is active...');
      
      // Make sure the role is active
      if (!adminRole.isActive) {
        await prisma.userRole.update({
          where: { id: adminRole.id },
          data: { isActive: true }
        });
        console.log('Admin role activated');
      } else {
        console.log('Admin role is already active');
      }
    } else {
      console.log('Creating admin role...');
      
      // Create admin role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'admin',
          isActive: true,
          isTestRole: false
        }
      });
      
      console.log('Admin role created');
    }
    
    // Ensure user has viewer role
    const viewerRole = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        role: 'viewer'
      }
    });
    
    if (!viewerRole) {
      console.log('Creating viewer role...');
      
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'viewer',
          isActive: true,
          isTestRole: false
        }
      });
      
      console.log('Viewer role created');
    }
    
    // Set current role to admin
    if (user.currentRole !== 'admin') {
      console.log('Setting current role to admin...');
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentRole: 'admin',
          previousRole: user.currentRole || 'viewer',
          lastRoleChange: new Date()
        }
      });
      
      console.log('Current role set to admin');
    } else {
      console.log('Current role is already admin');
    }
    
    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: true
      }
    });
    
    console.log('\nUser information after updates:');
    console.log('ID:', updatedUser.id);
    console.log('Current Role:', updatedUser.currentRole);
    console.log('Roles:');
    
    updatedUser.roles.forEach(role => {
      console.log(`- ${role.role} (Active: ${role.isActive}, Test: ${role.isTestRole})`);
    });
    
    console.log('\nAdmin access granted successfully!');
    
  } catch (error) {
    console.error('Error granting admin access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Constants for the owner's public key
const OWNER_NPUB = 'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed';
const OWNER_HEX_PUBKEY = '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a';

// Run the script
grantAdminAccess(OWNER_NPUB, OWNER_HEX_PUBKEY);