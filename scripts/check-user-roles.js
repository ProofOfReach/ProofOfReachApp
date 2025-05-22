/**
 * Script to check all users and their roles in the database
 * 
 * This script will list all users and their role information
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin pubkeys in both formats
const ADMIN_PUBKEYS = [
  'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed',  // npub format
  '832b6aa822d07f380a87f69178cabd823c682b29804407993356bacd2e4f082a'  // hex format
];

async function checkUserRoles() {
  try {
    console.log('Checking all users and their roles...');
    
    // Get all users with their roles
    const users = await prisma.user.findMany({
      include: {
        userRoles: true
      }
    });
    
    console.log(`Found ${users.length} users in the database`);
    
    // Keep track of issues
    let issueCount = 0;
    
    // Display information about each user
    users.forEach((user, index) => {
      // Check if this is an admin user
      const isAdminUser = ADMIN_PUBKEYS.includes(user.nostrPubkey);
      const adminFlag = isAdminUser ? '🔑 ADMIN' : '';
      
      // Check for role inconsistencies
      let roleIssues = [];
      
      // Admin checks - should have admin role
      if (isAdminUser && !user.isAdmin) {
        roleIssues.push('Admin pubkey without admin privileges');
      }
      
      // Non-admin checks - shouldn't have admin role
      if (!isAdminUser && user.isAdmin) {
        roleIssues.push('Non-admin pubkey with admin privileges');
      }
      
      // Non-admin shouldn't have developer or stakeholder roles
      if (!isAdminUser && (user.isDeveloper || user.isStakeholder)) {
        roleIssues.push('Non-admin with developer/stakeholder roles');
      }
      
      // Non-admin currentRole should be 'viewer' (or legacy 'user')
      if (!isAdminUser && user.currentRole !== 'viewer' && user.currentRole !== 'user' && !user.isTestUser) {
        roleIssues.push(`Invalid currentRole: ${user.currentRole}`);
      }
      
      // Update issue count
      if (roleIssues.length > 0) {
        issueCount++;
      }
      
      console.log(`\nUser ${index + 1}: ${adminFlag}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Nostr Pubkey: ${user.nostrPubkey.substring(0, 8)}...`);
      console.log(`  Created At: ${user.createdAt}`);
      console.log(`  Current Role: ${user.currentRole}`);
      console.log(`  Legacy Role Flags:`);
      console.log(`    - Admin: ${user.isAdmin}`);
      console.log(`    - Advertiser: ${user.isAdvertiser}`);
      console.log(`    - Publisher: ${user.isPublisher}`);
      console.log(`    - Developer: ${user.isDeveloper}`);
      console.log(`    - Stakeholder: ${user.isStakeholder}`);
      console.log(`    - Test User: ${user.isTestUser}`);
      console.log(`    - Active: ${user.isActive}`);
      
      // Show user roles from the UserRole table
      console.log('  UserRole Entries:');
      if (user.userRoles.length === 0) {
        console.log('    - None');
      } else {
        user.userRoles.forEach(role => {
          console.log(`    - ${role.role} (Active: ${role.isActive}, Test: ${role.isTestRole})`);
        });
      }
      
      // Display issues if any
      if (roleIssues.length > 0) {
        console.log('  ⚠️ ISSUES DETECTED:');
        roleIssues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }
    });
    
    // Summary
    console.log('\n=== Summary ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Users with role issues: ${issueCount}`);
    
    if (issueCount > 0) {
      console.log('\nTo fix role issues, run the fix-user-roles.js script');
    } else {
      console.log('\nAll user roles appear to be correctly configured!');
    }
    
  } catch (error) {
    console.error('Error checking user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkUserRoles();