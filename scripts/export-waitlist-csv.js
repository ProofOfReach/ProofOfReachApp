// Script to export waitlist entries to a CSV file
// Since this is a one-off script, we'll use a direct connection instead of the singleton pattern
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function exportWaitlistToCsv() {
  
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
    
    console.log(`Found ${entries.length} waitlist entries. Exporting to CSV...`);
    
    // Create CSV header
    const headers = [
      'email',
      'interested_roles',
      'signup_date',
      'source',
      'name',
      'ip_address'
    ].join(',');
    
    // Create CSV rows
    const rows = entries.map(entry => {
      // Format date to YYYY-MM-DD format
      const date = entry.createdAt.toISOString().split('T')[0];
      
      // Escape any commas in the fields
      const safeEmail = entry.email.includes(',') ? `"${entry.email}"` : entry.email;
      const safeRoles = entry.interestedRoles.includes(',') ? `"${entry.interestedRoles}"` : entry.interestedRoles;
      const safeSource = entry.source ? (entry.source.includes(',') ? `"${entry.source}"` : entry.source) : '';
      const safeName = entry.name ? (entry.name.includes(',') ? `"${entry.name}"` : entry.name) : '';
      const safeIp = entry.ipAddress ? (entry.ipAddress.includes(',') ? `"${entry.ipAddress}"` : entry.ipAddress) : '';
      
      return [
        safeEmail,
        safeRoles,
        date,
        safeSource,
        safeName,
        safeIp
      ].join(',');
    });
    
    // Combine header and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Write to file
    const outputPath = path.join(__dirname, '..', 'waitlist-export.csv');
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`CSV export complete! File saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error exporting waitlist entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
exportWaitlistToCsv();