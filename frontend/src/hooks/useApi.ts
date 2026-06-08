'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stocksAPI, adminAPI, healthAPI } from '@/lib/api';
import type {
  KMI30Company,
  StockDetails,
  AIMemo,
  ShariaComplianceSummary,
  ShariaCompliance,
  SystemHealth,
  GeminiPingResponse,
  ScraperLog,
  APILog,
} from '@/types/api';

// ============================================================================
// Stock Hooks
// ============================================================================

export const useKMI30 = () => {
  return useQuery({
    queryKey: ['stocks', 'kmi30'],
    queryFn: async () => {
      const { data } = await stocksAPI.getKMI30();
      return data as KMI30Company[];
    },
    staleTime: 5000,
  });
};

export const useStockDetails = (symbol: string | null | undefined) => {
  return useQuery({
    queryKey: ['stocks', 'details', symbol],
    queryFn: async () => {
      if (!symbol) throw new Error('Symbol is required');
      const { data } = await stocksAPI.getStockDetails(symbol);
      return data as StockDetails;
    },
    enabled: !!symbol,
    staleTime: 10000,
  });
};

export const useMemo = (symbol: string | null | undefined) => {
  return useQuery({
    queryKey: ['stocks', 'memo', symbol],
    queryFn: async () => {
      if (!symbol) throw new Error('Symbol is required');
      const { data } = await stocksAPI.getMemo(symbol);
      return data as AIMemo;
    },
    enabled: !!symbol,
    staleTime: 60000, // 1 minute - AI memos update less frequently
  });
};

export const useAllCompanies = (skip: number = 0, take: number = 20, search: string = '') => {
  return useQuery({
    queryKey: ['stocks', 'all', skip, take, search],
    queryFn: async () => {
      const { data } = await stocksAPI.getAllCompanies(skip, take, search);
      return data;
    },
    staleTime: 10000,
  });
};

export const useMarketNews = () => {
  return useQuery({
    queryKey: ['market', 'news'],
    queryFn: async () => {
      try {
        const { data } = await stocksAPI.getMarketNews();
        return data;
      } catch (error) {
        // Return mock data on error (rate limit or network failure)
        console.warn('Failed to fetch news, using mock data', error);
        return getMockNews();
      }
    },
    staleTime: 60000, // Cache for 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useMacroIndicators = () => {
  return useQuery({
    queryKey: ['market', 'macro'],
    queryFn: async () => {
      try {
        const { data } = await stocksAPI.getMacroIndicators();
        return data;
      } catch (error) {
        console.warn('Failed to fetch macro indicators, using defaults', error);
        return [];
      }
    },
    staleTime: 3600000, // Cache for 1 hour
  });
};

// Mock news data for fallback
function getMockNews() {
  return [
    {
      title: 'PSX Index Closes Higher on Banking Rally',
      description: 'The Pakistan Stock Exchange closed in positive territory today with banking stocks leading gains.',
      source: 'PSX Market Report',
      url: '#',
      publishedAt: new Date(),
      sentiment: 'positive',
      relevance: 95,
    },
    {
      title: 'KMI-30 Blue Chips Show Resilience',
      description: 'KMI-30 index stocks demonstrate stability amid global economic uncertainties.',
      source: 'Financial Times',
      url: '#',
      publishedAt: new Date(Date.now() - 3600000),
      sentiment: 'neutral',
      relevance: 88,
    },
    {
      title: 'Cement Sector Gains on Infrastructure Boost',
      description: 'Cement manufacturing stocks rise following government infrastructure spending announcement.',
      source: 'Market Insider',
      url: '#',
      publishedAt: new Date(Date.now() - 7200000),
      sentiment: 'positive',
      relevance: 92,
    },
  ];
}

// ============================================================================
// Shariah Compliance Hooks
// ============================================================================

export const useShariaStatus = () => {
  return useQuery({
    queryKey: ['shariah', 'status'],
    queryFn: async () => {
      const { data } = await stocksAPI.getShariaStatus();
      return data as ShariaComplianceSummary;
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useNonCompliantStocks = () => {
  return useQuery({
    queryKey: ['shariah', 'non-compliant'],
    queryFn: async () => {
      const { data } = await stocksAPI.getNonCompliant();
      return data as ShariaCompliance[];
    },
    staleTime: 30000,
  });
};

// ============================================================================
// System Health Hooks
// ============================================================================

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const { data } = await healthAPI.getHealth();
      return data as SystemHealth;
    },
    staleTime: 10000,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useGeminiPing = (enabled = false) => {
  return useQuery({
    queryKey: ['system', 'gemini-ping'],
    queryFn: async () => {
      const { data } = await healthAPI.pingGemini();
      return data as GeminiPingResponse;
    },
    enabled,
    staleTime: 60000,
  });
};

// ============================================================================
// Admin Hooks
// ============================================================================

export const useScraperLogs = (enabled = false) => {
  return useQuery({
    queryKey: ['admin', 'logs', 'scraper'],
    queryFn: async () => {
      const { data } = await adminAPI.getScraperLogs();
      return data as ScraperLog[];
    },
    enabled,
    staleTime: 30000,
  });
};

export const useLatencyLogs = (enabled = false) => {
  return useQuery({
    queryKey: ['admin', 'logs', 'latency'],
    queryFn: async () => {
      const { data } = await adminAPI.getLatencyLogs();
      return data as APILog[];
    },
    enabled,
    staleTime: 30000,
  });
};

// ============================================================================
// Admin Mutations
// ============================================================================

export const useSyncLivePrices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminAPI.syncLivePrices();
      return data;
    },
    onSuccess: () => {
      // Invalidate KMI-30 data after sync
      queryClient.invalidateQueries({ queryKey: ['stocks', 'kmi30'] });
    },
  });
};

export const useSyncHistorical = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (symbols?: string[]) => {
      const { data } = await adminAPI.syncHistorical(symbols);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
};

export const useSyncPSXHeader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminAPI.syncPSXHeader();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
};

export const useAuditShariah = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminAPI.auditShariah();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shariah'] });
    },
  });
};
