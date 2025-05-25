import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

interface WalletBalance {
  balance: number;
  currency?: string;
}

// Fetch wallet balance from your existing API
const fetchWalletBalance = async (): Promise<WalletBalance> => {
  const response = await fetch('/api/wallet', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wallet balance: ${response.status}`);
  }

  return response.json();
};

export const useWalletBalance = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.wallet.balance,
    queryFn: fetchWalletBalance,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    retry: 3,
    enabled: options?.enabled !== false,
  });
};