// Script to view all waitlist entries
// Since this is a one-off script, we'll use a direct connection instead of the singleton pattern
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function viewWaitlist() {
  
  try {
    console.log('Fetching waitlist entries...');
    
    const entries = await prisma.launchEmail.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (entries.length === 0) {
      console.log('No waitlist entries found.');
      return;
    }
    
    console.log(`Found ${entries.length} waitlist entries:`);
    console.log('='.repeat(80));
    
    entries.forEach((entry, index) => {
      console.log(`Entry #${index + 1}:`);
      console.log(`- Email: ${entry.email}`);
      console.log(`- Interested Roles: ${entry.interestedRoles}`);
      console.log(`- Signed up: ${entry.createdAt.toLocaleString()}`);
      if (entry.source) console.log(`- Source: ${entry.source}`);
      if (entry.name) console.log(`- Name: ${entry.name}`);
      console.log('-'.repeat(40));
    });
    
  } catch (error) {
    console.error('Error retrieving waitlist entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
viewWaitlist();