import { QueryClient } from '@tanstack/react-query';

// Configure React Query with optimized settings for ProofOfReach
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  wallet: {
    balance: ['wallet', 'balance'] as const,
    transactions: ['wallet', 'transactions'] as const,
  },
  campaigns: {
    all: ['campaigns'] as const,
    detail: (id: string) => ['campaigns', id] as const,
    analytics: (id: string) => ['campaigns', id, 'analytics'] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
    roles: ['user', 'roles'] as const,
  },
} as const;