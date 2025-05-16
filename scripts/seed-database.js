// Seed script to create sample ads and users for testing
// Since this is a one-off script, we'll use a direct connection instead of the singleton pattern
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Create test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { nostrPubkey: '0c40a62341fdcbc15651c3e91bc6618e7e720c56d439507ff72cc23093dc4ff2' },
      update: {},
      create: {
        nostrPubkey: '0c40a62341fdcbc15651c3e91bc6618e7e720c56d439507ff72cc23093dc4ff2',
        isAdvertiser: true,
        isPublisher: true,
        balance: 10000, // 10,000 sats
        preferences: {
          create: {} // default preferences
        }
      }
    });
    
    console.log('Test user created or updated:', testUser.id);
    
    // Create test ads
    const testAds = [
      {
        title: 'Bitcoin: Digital Gold for the Digital Age',
        description: 'Learn how Bitcoin is transforming global finance and why it\'s becoming the preferred store of value for individuals and institutions worldwide.',
        imageUrl: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        targetUrl: 'https://example.com/bitcoin-guide',
        urlParameters: 'utm_source=nostr&utm_medium=ad&utm_campaign=bitcoin',
        budget: 100000, // 100,000 sats
        dailyBudget: 10000, // 10,000 sats
        bidPerImpression: 200, // 200 sats
        bidPerClick: 1000, // 1,000 sats
        status: 'ACTIVE',
        freqCapViews: 2,
        freqCapHours: 24,
        advertiserId: testUser.id
      },
      {
        title: 'Secure Your Digital Future with Cold Storage',
        description: 'Our military-grade hardware wallets provide the ultimate protection for your Bitcoin and digital assets against both physical and virtual threats.',
        imageUrl: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        targetUrl: 'https://example.com/cold-storage',
        urlParameters: 'utm_source=nostr&utm_medium=ad&utm_campaign=security',
        budget: 80000, // 80,000 sats
        dailyBudget: 8000, // 8,000 sats
        bidPerImpression: 150, // 150 sats
        bidPerClick: 800, // 800 sats
        status: 'ACTIVE',
        freqCapViews: 3,
        freqCapHours: 12,
        advertiserId: testUser.id
      },
      {
        title: 'Lightning Network: The Future of Bitcoin Payments',
        description: 'Instant, nearly fee-free Bitcoin transactions are here. Our Lightning wallet makes sending sats as easy as sending a text message.',
        imageUrl: 'https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        targetUrl: 'https://example.com/lightning-wallet',
        urlParameters: 'utm_source=nostr&utm_medium=ad&utm_campaign=lightning',
        budget: 120000, // 120,000 sats
        dailyBudget: 12000, // 12,000 sats
        bidPerImpression: 250, // 250 sats
        bidPerClick: 1200, // 1,200 sats
        status: 'ACTIVE',
        freqCapViews: 5,
        freqCapHours: 48,
        advertiserId: testUser.id
      }
    ];
    
    // Add each ad to the database
    for (const adData of testAds) {
      const ad = await prisma.ad.upsert({
        where: { 
          // Create a unique condition based on title and advertiser
          id: `${adData.title.substring(0, 10).toLowerCase().replace(/\s+/g, '-')}-${testUser.id.substring(0, 5)}`
        },
        update: adData,
        create: {
          ...adData,
          id: `${adData.title.substring(0, 10).toLowerCase().replace(/\s+/g, '-')}-${testUser.id.substring(0, 5)}`
        }
      });
      
      console.log('Ad created or updated:', ad.id);
    }
    
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();