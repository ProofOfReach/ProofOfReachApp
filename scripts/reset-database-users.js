/**
 * Script to reset all user accounts except for the admin account
 * 
 * This script will delete all users except for the specified admin pubkey
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Your admin pubkey in both formats
const ADMIN_PUBKEYS = [
  'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed',  // npub format
  '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a'  // hex format
];

async function resetDatabaseUsers() {
  try {
    console.log('Starting database user reset process...');
    
    // First, get all user IDs except the admin
    const users = await prisma.user.findMany({
      where: {
        nostrPubkey: {
          notIn: ADMIN_PUBKEYS
        }
      },
      select: {
        id: true,
        nostrPubkey: true
      }
    });
    
    console.log(`Found ${users.length} non-admin users to delete`);
    
    // Delete all users except admin
    const deleteResult = await prisma.user.deleteMany({
      where: {
        nostrPubkey: {
          notIn: ADMIN_PUBKEYS
        }
      }
    });
    
    console.log(`Deleted ${deleteResult.count} users`);
    
    // Now make sure the admin user is properly configured
    // Get the admin user(s) - there should be only one, but check both formats
    const adminUsers = await prisma.user.findMany({
      where: {
        nostrPubkey: {
          in: ADMIN_PUBKEYS
        }
      }
    });
    
    // If no admin users exist, potentially create one with npub format
    if (adminUsers.length === 0) {
      console.log('No admin users found. Creating admin account with default privileges.');
      
      await prisma.user.create({
        data: {
          nostrPubkey: ADMIN_PUBKEYS[0], // Use npub format
          isAdmin: true,
          isAdvertiser: true,
          isPublisher: true,
          isDeveloper: true,
          isStakeholder: true,
          currentRole: 'admin',
          isTestUser: false,
          isActive: true
        }
      });
      
      // Fetch the created admin user
      const newAdminUser = await prisma.user.findUnique({
        where: { nostrPubkey: ADMIN_PUBKEYS[0] }
      });
      
      if (newAdminUser) {
        console.log(`Created admin user with pubkey: ${newAdminUser.nostrPubkey.substring(0, 8)}...`);
        adminUsers.push(newAdminUser);
      }
    }
    
    console.log(`Found ${adminUsers.length} admin users`);
    
    // Fix any admin users to have proper settings
    for (const adminUser of adminUsers) {
      console.log(`Ensuring admin privileges for user with pubkey: ${adminUser.nostrPubkey.substring(0, 8)}...`);
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          isAdmin: true,
          isAdvertiser: true,
          isPublisher: true,
          isDeveloper: true,
          isStakeholder: true,
          currentRole: 'admin',
          isTestUser: false,
          isActive: true
        }
      });
      
      // Ensure admin has all UserRole entries
      for (const role of ['admin', 'advertiser', 'publisher', 'developer', 'stakeholder']) {
        await prisma.userRole.upsert({
          where: {
            id: `${adminUser.id}-${role}`
          },
          update: {
            isActive: true,
            isTestRole: false
          },
          create: {
            id: `${adminUser.id}-${role}`,
            userId: adminUser.id,
            role: role,
            isActive: true,
            isTestRole: false
          }
        });
      }
    }
    
    console.log('Database user reset complete!');
    
  } catch (error) {
    console.error('Error resetting database users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
resetDatabaseUsers();