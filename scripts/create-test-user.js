#!/usr/bin/env node

/**
 * Script to create the test user needed for API key functionality
 * Run with: node scripts/create-test-user.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user for API key functionality...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 'test-user-dev' }
    });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.id);
      return;
    }
    
    // Create the test user
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-dev',
        nostrPubkey: 'npub1v8h78np69wvckm0xh52djsm9e2xzm0fwfklzhswjtqt3shyhu0vq4z6eak', // Valid test Nostr pubkey
        isTestUser: true,
        currentRole: 'admin', // Give admin role for testing
        balance: 100000 // 100k sats for testing
      }
    });
    
    console.log('✅ Test user created successfully:', testUser.id);
    console.log('   Nostr Pubkey:', testUser.nostrPubkey);
    console.log('   Role:', testUser.currentRole);
    console.log('   API key creation should now work properly!');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();