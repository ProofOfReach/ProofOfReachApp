// Mock user data
export const mockUser = {
  id: 'user-1',
  pubkey: 'test-pubkey',
  name: 'Test User',
  email: 'test@example.com',
  balance: 10000,
  monthlyEarnings: 2500,
  totalEarnings: 15000,
  createdAt: '2023-01-01T00:00:00Z',
  preferences: {
    theme: 'LIGHT',
    emailNotifications: true,
    adPreferences: {
      categories: ['TECHNOLOGY', 'FINANCE'],
      excludedAdvertisers: [],
    },
  },
};

// Mock ads data
export const mockAds = [
  {
    id: 'ad-1',
    title: 'Test Ad 1',
    description: 'This is a test ad description',
    imageUrl: 'https://example.com/image1.jpg',
    targetUrl: 'https://example.com/target1',
    budget: 5000,
    bidPerImpression: 10,
    status: 'ACTIVE',
    createdAt: '2023-04-01T12:00:00Z',
    impressions: 120,
    clicks: 15,
  },
  {
    id: 'ad-2',
    title: 'Test Ad 2',
    description: 'Another test ad description',
    imageUrl: 'https://example.com/image2.jpg',
    targetUrl: 'https://example.com/target2',
    budget: 3000,
    bidPerImpression: 5,
    status: 'PENDING',
    createdAt: '2023-04-02T12:00:00Z',
    impressions: 0,
    clicks: 0,
  }
];

// Mock spaces data
export const mockSpaces = [
  {
    id: 'space-1',
    name: 'Test Space 1',
    description: 'A test publisher space',
    website: 'https://example.com/space1',
    dimensions: '728x90',
    category: 'TECHNOLOGY',
    status: 'ACTIVE',
    createdAt: '2023-03-01T12:00:00Z',
    impressions: 500,
    revenue: 2500,
    placements: [
      { id: 'p1', impressions: 300, clicks: 25 },
      { id: 'p2', impressions: 200, clicks: 15 }
    ]
  },
  {
    id: 'space-2',
    name: 'Test Space 2',
    description: 'Another test publisher space',
    website: 'https://example.com/space2',
    dimensions: '300x250',
    category: 'FINANCE',
    status: 'PENDING',
    createdAt: '2023-03-15T12:00:00Z',
    impressions: 0,
    revenue: 0,
    placements: []
  }
];

// Mock transactions data
export const mockTransactions = [
  {
    id: 'tx-1',
    type: 'DEPOSIT',
    amount: 5000,
    status: 'COMPLETED',
    description: 'Deposit via Lightning',
    createdAt: '2023-04-10T10:30:00Z',
  },
  {
    id: 'tx-2',
    type: 'WITHDRAWAL',
    amount: 2000,
    status: 'COMPLETED',
    description: 'Withdrawal to Lightning wallet',
    createdAt: '2023-04-15T14:22:00Z',
  },
  {
    id: 'tx-3',
    type: 'AD_PAYMENT',
    amount: 350,
    status: 'COMPLETED',
    description: 'Ad impressions payment',
    createdAt: '2023-04-18T09:15:00Z',
  },
  {
    id: 'tx-4',
    type: 'SPACE_EARNING',
    amount: 450,
    status: 'COMPLETED',
    description: 'Space earnings',
    createdAt: '2023-04-20T16:45:00Z',
  },
  {
    id: 'tx-5',
    type: 'DEPOSIT',
    amount: 10000,
    status: 'PENDING',
    description: 'Deposit via Lightning',
    createdAt: '2023-04-25T11:20:00Z',
  }
];