'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Global TanStack Query Provider - Zero-Crash Architecture
 * - Exponential backoff retry (2x attempts)
 * - Auto-refetch on window focus for cache synergy with Redis
 * - Market-optimized stale times (5s for live prices)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Data becomes stale after 5 seconds (optimized for live market data)
      staleTime: 5 * 1000,
      // ✅ Keep data in cache for 5 minutes after being garbage collected
      gcTime: 5 * 60 * 1000,
      // ✅ Automatically refetch when window regains focus (synergizes with Redis)
      refetchOnWindowFocus: true,
      // ✅ Retry exactly 2 times on failure
      retry: (failureCount, error: any) => {
        // Don't retry if error is 401/403 (auth issues)
        if (error?.status === 401 || error?.status === 403) return false;
        // Retry max 2 times
        return failureCount < 2;
      },
      // ✅ Exponential backoff: 1s → 2s → 4s (capped at 30s)
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * Math.pow(2, attemptIndex), 30 * 1000);
      },
    },
    mutations: {
      // ✅ Mutations retry once with 1s delay
      retry: (failureCount) => failureCount < 1,
      retryDelay: 1000,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
