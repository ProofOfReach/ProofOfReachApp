/**
 * Script to sync role flags with UserRole table
 * Run with: node scripts/sync-role-data.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { nip19 } = require('nostr-tools');

// Get the Nostr pubkey from the command line argument or use a default for testing
let npub = process.argv[2] || 'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed';
  
async function syncRoleData() {
  try {
    let hexPubkey;
    
    // If it starts with npub, convert it to hex
    if (npub.startsWith('npub')) {
      try {
        const { data } = nip19.decode(npub);
        hexPubkey = data;
        console.log(`Converted npub to hex: ${hexPubkey}`);
      } catch (error) {
        console.error('Error converting npub to hex:', error);
        process.exit(1);
      }
    } else {
      hexPubkey = npub;
    }
    
    console.log(`Syncing roles for pubkey: ${hexPubkey}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: hexPubkey },
      include: {
        userRoles: true
      }
    });
    
    if (!user) {
      console.log(`User not found with pubkey: ${hexPubkey}`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.id}`);
    console.log('Current flags:');
    console.log(`  isAdmin: ${user.isAdmin}`);
    console.log(`  isPublisher: ${user.isPublisher}`);
    console.log(`  isAdvertiser: ${user.isAdvertiser}`);
    console.log(`  isStakeholder: ${user.isStakeholder}`);
    console.log(`  isDeveloper: ${user.isDeveloper}`);
    
    console.log('Current UserRole records:');
    if (user.userRoles.length === 0) {
      console.log('  No UserRole records found');
    } else {
      for (const role of user.userRoles) {
        console.log(`  Role: ${role.role}, Active: ${role.isActive}, TestRole: ${role.isTestRole}`);
      }
    }
    
    // Sync the roles
    console.log('\nSyncing roles...');
    
    // Define the roles to sync
    const rolesToSync = [
      { role: 'admin', hasFlag: user.isAdmin },
      { role: 'publisher', hasFlag: user.isPublisher },
      { role: 'advertiser', hasFlag: user.isAdvertiser },
      { role: 'stakeholder', hasFlag: user.isStakeholder },
      { role: 'developer', hasFlag: user.isDeveloper }
    ];
    
    // Create or update UserRole records based on flags
    for (const { role, hasFlag } of rolesToSync) {
      if (hasFlag) {
        await prisma.userRole.upsert({
          where: {
            id: `${user.id}-${role}`
          },
          update: {
            isActive: true,
            isTestRole: false
          },
          create: {
            id: `${user.id}-${role}`,
            userId: user.id,
            role,
            isActive: true,
            isTestRole: false
          }
        });
        console.log(`Synced ${role} role to UserRole table`);
      }
    }
    
    // Make sure everyone has the viewer role
    await prisma.userRole.upsert({
      where: {
        id: `${user.id}-viewer`
      },
      update: {
        isActive: true,
        isTestRole: false
      },
      create: {
        id: `${user.id}-viewer`,
        userId: user.id,
        role: 'viewer',
        isActive: true,
        isTestRole: false
      }
    });
    console.log('Synced viewer role to UserRole table');
    
    // Verify the sync
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: true
      }
    });
    
    console.log('\nVerifying sync results:');
    console.log('Updated UserRole records:');
    for (const role of updatedUser.userRoles) {
      console.log(`  Role: ${role.role}, Active: ${role.isActive}, TestRole: ${role.isTestRole}`);
    }
    
    console.log('\nSync completed successfully.');
  } catch (error) {
    console.error('Error syncing roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncRoleData();