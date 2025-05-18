/**
 * Script to fix viewer roles in the database
 * 
 * This script will correct role assignments for all non-admin users
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Your admin pubkey - should be the only one with admin access
// Include both npub and hex formats
const ADMIN_PUBKEYS = [
  'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed',  // npub format
  '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a'  // hex format
];

async function fixUserRoles() {
  try {
    console.log('Starting viewer role fix process...');
    
    // Get all non-admin users that may have incorrect privileges
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        nostrPubkey: {
          notIn: ADMIN_PUBKEYS
        }
      }
    });
    
    console.log(`Found ${nonAdminUsers.length} non-admin users to check`);
    
    // Keep track of users that need fixing
    let fixedCount = 0;
    
    // Process each non-admin user
    for (const user of nonAdminUsers) {
      const needsFix = user.isAdmin === true || 
                       user.isDeveloper === true || 
                       user.isStakeholder === true ||
                       (user.currentRole !== 'viewer' && user.currentRole !== 'user');
                       
      if (needsFix) {
        console.log(`Fixing roles for user ${user.id} (${user.nostrPubkey.substring(0, 8)}...)`);
        
        // Update the user to have correct role flags
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isAdmin: false,
            isDeveloper: false,
            isStakeholder: false,
            currentRole: 'viewer',
            // We allow advertiser/publisher based on test mode status
            isAdvertiser: user.isTestUser ? true : false,
            isPublisher: user.isTestUser ? true : false
          }
        });
        
        // Remove any admin/developer/stakeholder role entries from UserRole table
        await prisma.userRole.deleteMany({
          where: {
            userId: user.id,
            role: {
              in: ['admin', 'developer', 'stakeholder']
            }
          }
        });
        
        fixedCount++;
      }
    }
    
    console.log(`Fixed roles for ${fixedCount} users`);
    
    // Make sure admin has admin privileges
    // Try to find an admin user with any of the specified pubkeys
    const adminUsers = await prisma.user.findMany({
      where: {
        nostrPubkey: {
          in: ADMIN_PUBKEYS
        }
      },
      include: { userRoles: true }
    });
    
    if (adminUsers.length > 0) {
      console.log(`Found ${adminUsers.length} admin user(s)`);
      
      for (const adminUser of adminUsers) {
        console.log(`Ensuring admin privileges for user ${adminUser.id} (${adminUser.nostrPubkey.substring(0, 8)}...)`);
        
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
        
        // Ensure admin has all role entries
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
      
      console.log('Admin privileges ensured');
    } else {
      console.log('No admin users found in database. This is concerning!');
      console.log('Please ensure at least one user with the specified pubkeys exists.');
    }
    
    console.log('Viewer role fix process complete!');
    
  } catch (error) {
    console.error('Error fixing viewer roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixUserRoles();