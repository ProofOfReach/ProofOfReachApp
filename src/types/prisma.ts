import { User as PrismaUser } from '@prisma/client';

// Export the Prisma User type enhanced with proper typing
export type User = PrismaUser & {
  id: string;
  nostrPubkey: string;
  isAdvertiser: boolean;
  isPublisher: boolean;
  isAdmin: boolean;
  isStakeholder: boolean;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

// Export other Prisma types as needed
export type { UserPreferences } from '@prisma/client';