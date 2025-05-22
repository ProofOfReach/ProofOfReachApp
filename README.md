# Proof Of Reach

A decentralized ad marketplace built on the Nostr protocol with Bitcoin and Lightning Network payment integration.

## SDK Usage Example

```javascript
// Import the SDK
const { ProofOfReachSDK } = require('@proofofreach/sdk');

// Initialize with your API key
const sdk = new ProofOfReachSDK({
  apiKey: 'your-api-key',
  debug: true // Optional
});

// Serve an ad
async function displayAd() {
  const ad = await sdk.serveAd({
    placement: 'sidebar',
    pubkey: 'your-nostr-pubkey',
    interests: ['bitcoin', 'technology']
  });
  
  if (ad) {
    console.log('Ad received:', ad.title);
    // Render the ad in your application
  }
}

// Track a click
async function trackAdClick(adId) {
  await sdk.trackClick({
    adId: adId,
    pubkey: 'your-nostr-pubkey',
    placement: 'sidebar'
  });
}
```

## Features

- Decentralized advertising platform using Nostr
- Bitcoin and Lightning Network payment integration
- Role-based access control (publishers, advertisers, administrators)
- API for programmatic ad serving and analytics
- JavaScript SDK for easy integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/SuJubilacion/ProofOfReach.git
cd ProofOfReach
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

4. Set up database
```bash
npx prisma generate
npx prisma db push
```

5. Run development server
```bash
npm run dev
```

## Technologies

- Next.js with TypeScript
- Prisma ORM
- Nostr protocol
- Lightning Network
- TailwindCSS
- PostgreSQL

## License

MIT