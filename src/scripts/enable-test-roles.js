// This script directly enables all roles for the current user in the database
// Run this with: node src/scripts/enable-test-roles.js

// Use the singleton Prisma client instance
const { prisma } = require('../../lib/prismaClient');

// Get the user ID from command line arguments or use test user ID
const userId = process.argv[2] || 'test_user_id';

async function enableAllRoles() {
  try {
    console.log(`Enabling all roles for user: ${userId}`);
    
    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!existingUser) {
      // Create a test user if none exists
      console.log('User not found, creating test user...');
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          nostrPubkey: `pk_test_${Date.now()}`,
          isAdvertiser: true,
          isPublisher: true,
          isAdmin: true,
          isStakeholder: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      console.log('Created test user with ID:', newUser.id);
      
      // Create user preferences
      await prisma.userPreferences.create({
        data: {
          userId: newUser.id,
          currentRole: 'advertiser',
          lastRoleChange: new Date(),
        },
      });
      
      console.log('Created user preferences');
      return;
    }
    
    // Update existing user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isAdvertiser: true,
        isPublisher: true,
        isAdmin: true,
        isStakeholder: true,
        updatedAt: new Date(),
      },
    });
    
    console.log('Updated user roles:', updatedUser);
    
    // Ensure user preferences exist
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });
    
    if (existingPreferences) {
      await prisma.userPreferences.update({
        where: { userId },
        data: {
          currentRole: 'advertiser',
          lastRoleChange: new Date(),
        },
      });
    } else {
      await prisma.userPreferences.create({
        data: {
          userId,
          currentRole: 'advertiser',
          lastRoleChange: new Date(),
        },
      });
    }
    
    console.log('User preferences updated');
    console.log('Successfully enabled all roles');
  } catch (error) {
    console.error('Error enabling roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableAllRoles();