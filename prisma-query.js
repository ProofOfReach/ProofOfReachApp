// Use the singleton Prisma client to prevent connection issues
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Note: For production code, we would use the singleton approach:
// const { prisma } = require('./src/lib/prismaClient');
// This script is a one-off utility that doesn't need the singleton pattern

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();