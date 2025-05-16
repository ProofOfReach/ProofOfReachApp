/**
 * Script to check the current roles for all users
 * Run with: node scripts/check-current-roles.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentRoles() {
  try {
    console.log('=== User Role System Status Check ===');
    
    // Find all users
    const users = await prisma.user.findMany({
      include: {
        userRoles: true
      }
    });
    
    console.log(`Total users in database: ${users.length}`);
    
    // Check user role assignments
    const roleStats = {
      total: users.length,
      withoutCurrentRole: 0,
      withViewer: 0,
      withActiveRoles: {},
      currentRoleDistribution: {}
    };
    
    for (const user of users) {
      // Count currentRole distribution
      const currentRole = user.currentRole || 'none';
      roleStats.currentRoleDistribution[currentRole] = 
        (roleStats.currentRoleDistribution[currentRole] || 0) + 1;
      
      if (!user.currentRole) {
        roleStats.withoutCurrentRole++;
      }
      
      // Check for viewer role
      const hasViewerRole = user.userRoles.some(r => r.role === 'viewer' && r.isActive);
      if (hasViewerRole) {
        roleStats.withViewer++;
      }
      
      // Count active roles by type
      user.userRoles.forEach(role => {
        if (role.isActive) {
          roleStats.withActiveRoles[role.role] = 
            (roleStats.withActiveRoles[role.role] || 0) + 1;
        }
      });
    }
    
    // Output statistics
    console.log('\n=== Role Statistics ===');
    console.log(`Users without currentRole set: ${roleStats.withoutCurrentRole}`);
    console.log(`Users with viewer role: ${roleStats.withViewer}`);
    
    console.log('\n=== Current Role Distribution ===');
    Object.entries(roleStats.currentRoleDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([role, count]) => {
        console.log(`${role}: ${count} users (${(count/roleStats.total*100).toFixed(1)}%)`);
      });
    
    console.log('\n=== Active Role Assignments ===');
    Object.entries(roleStats.withActiveRoles)
      .sort((a, b) => b[1] - a[1])
      .forEach(([role, count]) => {
        console.log(`${role}: ${count} users (${(count/roleStats.total*100).toFixed(1)}%)`);
      });
    
    // Check for any discrepancies
    const discrepancies = [];
    
    for (const user of users) {
      // User has currentRole but no corresponding UserRole record
      if (user.currentRole && !user.userRoles.some(r => r.role === user.currentRole && r.isActive)) {
        discrepancies.push({
          type: 'missing-role-record',
          userId: user.id,
          nostrPubkey: user.nostrPubkey,
          currentRole: user.currentRole
        });
      }
      
      // User doesn't have viewer role
      if (!user.userRoles.some(r => r.role === 'viewer' && r.isActive)) {
        discrepancies.push({
          type: 'missing-viewer-role',
          userId: user.id,
          nostrPubkey: user.nostrPubkey
        });
      }
    }
    
    // Report discrepancies
    if (discrepancies.length > 0) {
      console.log('\n=== Discrepancies Found ===');
      console.log(`Total discrepancies: ${discrepancies.length}`);
      
      const missingRoleRecords = discrepancies.filter(d => d.type === 'missing-role-record');
      if (missingRoleRecords.length > 0) {
        console.log(`\nUsers with currentRole but no corresponding UserRole record: ${missingRoleRecords.length}`);
        missingRoleRecords.forEach(d => {
          console.log(`- User ${d.userId} (${d.nostrPubkey}): currentRole=${d.currentRole}`);
        });
      }
      
      const missingViewerRoles = discrepancies.filter(d => d.type === 'missing-viewer-role');
      if (missingViewerRoles.length > 0) {
        console.log(`\nUsers without viewer role: ${missingViewerRoles.length}`);
        missingViewerRoles.forEach(d => {
          console.log(`- User ${d.userId} (${d.nostrPubkey})`);
        });
      }
    } else {
      console.log('\n✅ No discrepancies found. Role system is consistent!');
    }
    
  } catch (error) {
    console.error('Error checking roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkCurrentRoles();