/**
 * This script directly seeds a test user with all roles into the database
 * Only for development/debug purposes
 */

// Since this is a one-off script, we'll use a direct connection instead of the singleton pattern
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get user input with a promise wrapper
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

async function seedRoles() {
  console.log('Starting role seeding process...');
  
  try {
    // Ask for nostr pubkey
    const nostrPubkey = await question('Enter your nostr pubkey (or press Enter to use the default test key): ');
    const pubkey = nostrPubkey || 'c2c0c13043bab24ad71c84037e29f992cec326d3fa5baff42171cad84b7beba5';
    
    console.log(`Using pubkey: ${pubkey}`);
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey }
    });
    
    if (!user) {
      console.log('User not found, creating a new user...');
      user = await prisma.user.create({
        data: {
          nostrPubkey: pubkey,
          isAdvertiser: true,
          isPublisher: true,
          isAdmin: true,
          isStakeholder: true
        }
      });
      console.log('User created with ID:', user.id);
    } else {
      console.log('User found, updating roles...');
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isAdvertiser: true,
          isPublisher: true,
          isAdmin: true,
          isStakeholder: true
        }
      });
      console.log('User updated with ID:', user.id);
    }
    
    // Create or update user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        currentRole: 'user',
        lastRoleChange: new Date()
      },
      create: {
        userId: user.id,
        currentRole: 'user',
        lastRoleChange: new Date()
      }
    });
    
    console.log('User preferences set with ID:', preferences.id);
    
    // Print all users for verification
    const allUsers = await prisma.user.findMany({
      include: {
        preferences: true
      }
    });
    
    console.log('Current users in database:');
    allUsers.forEach(u => {
      console.log(`ID: ${u.id}, Pubkey: ${u.nostrPubkey}`);
      console.log(`  Roles: Advertiser=${u.isAdvertiser}, Publisher=${u.isPublisher}, Admin=${u.isAdmin}, Stakeholder=${u.isStakeholder}`);
      console.log(`  Current Role: ${u.preferences?.currentRole || 'none'}`);
      console.log('---');
    });
    
    console.log('Seeding complete! 🌱');
  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Execute the function
seedRoles();