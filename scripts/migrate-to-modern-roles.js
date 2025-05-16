/**
 * Script to migrate all users to the modern role system
 * Run with: node scripts/migrate-to-modern-roles.js
 * 
 * This script will ensure that all users:
 * 1. Have a viewer role entry in the UserRole table
 * 2. Have a UserRole record for their current role if it's not 'viewer'
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToModernRoles() {
  try {
    console.log('Starting migration to modern role system...');
    
    // Find all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to process`);
    
    let migrated = 0;

    for (const user of users) {
      // Get existing UserRole records for this user
      const userRoles = await prisma.userRole.findMany({
        where: { userId: user.id }
      });
      
      // Always ensure viewer role
      const hasViewerRole = userRoles.some(r => r.role === 'viewer' && r.isActive);
      
      if (!hasViewerRole) {
        await prisma.userRole.upsert({
          where: { id: `${user.id}-viewer` },
          update: { isActive: true },
          create: {
            id: `${user.id}-viewer`,
            userId: user.id,
            role: 'viewer',
            isActive: true,
            isTestRole: false
          }
        });
        console.log(`  Created 'viewer' role for user ${user.id}`);
      }
      
      // If user has a currentRole other than viewer, ensure it exists
      if (user.currentRole && user.currentRole !== 'viewer') {
        const hasCurrentRole = userRoles.some(r => 
          r.role === user.currentRole && r.isActive
        );
        
        if (!hasCurrentRole) {
          await prisma.userRole.upsert({
            where: { id: `${user.id}-${user.currentRole}` },
            update: { isActive: true },
            create: {
              id: `${user.id}-${user.currentRole}`,
              userId: user.id,
              role: user.currentRole,
              isActive: true,
              isTestRole: false
            }
          });
          console.log(`  Created '${user.currentRole}' role for user ${user.id}`);
        }
      }
      
      migrated++;
      
      // Log progress every 10 users
      if (migrated % 10 === 0) {
        console.log(`Processed ${migrated}/${users.length} users`);
      }
    }
    
    console.log(`\nMigration complete! ${migrated} users migrated to modern role system.`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToModernRoles();