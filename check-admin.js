// Simple script to check if the admin exists
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_PUBKEY = 'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed';

async function checkAdmin() {
  try {
    console.log('Looking for admin with pubkey:', ADMIN_PUBKEY);
    
    // Convert npub to hex format first
    const { nip19 } = require('nostr-tools');
    let hexPubkey;
    
    try {
      const decoded = nip19.decode(ADMIN_PUBKEY);
      hexPubkey = decoded.data;
      console.log('Converted npub to hex:', hexPubkey);
    } catch (error) {
      console.log('Could not decode npub, assuming it\'s already hex');
      hexPubkey = ADMIN_PUBKEY;
    }
    
    // Now search for the admin
    const admin = await prisma.user.findUnique({
      where: { nostrPubkey: hexPubkey },
      include: { userRoles: true }
    });
    
    console.log('Admin user found:', admin ? 'Yes' : 'No');
    
    if (admin) {
      console.log('Admin ID:', admin.id);
      console.log('Admin Roles:', admin.userRoles);
      console.log('isAdmin flag:', admin.isAdmin);
      console.log('Current role:', admin.currentRole);
    } else {
      console.log('No matching admin user found with that pubkey.');
      
      // Let's try to find users with admin privileges
      const adminUsers = await prisma.user.findMany({
        where: { isAdmin: true },
        select: {
          id: true,
          nostrPubkey: true,
          currentRole: true,
          isAdmin: true
        }
      });
      
      console.log('\nFound', adminUsers.length, 'users with admin privileges:');
      adminUsers.forEach(user => {
        console.log(`- ID: ${user.id}, Pubkey: ${user.nostrPubkey.substring(0, 8)}..., Role: ${user.currentRole}`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();