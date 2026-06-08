import { useMemo, useCallback } from 'react';

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Stock item interface for sorting/filtering
 */
export interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  [key: string]: any;
}

/**
 * useStockListSorting - Memoized sorting function for KMI-30 list
 * Prevents unnecessary re-renders when sorting/filtering
 */
export function useStockListSorting(
  data: StockItem[] | undefined,
  sortBy: keyof StockItem | null = null,
  direction: SortDirection = 'desc',
) {
  return useMemo(() => {
    if (!data || !sortBy) return data || [];

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return sorted;
  }, [data, sortBy, direction]);
}

/**
 * useStockListFiltering - Memoized filtering function
 * Filters by search term across multiple fields
 */
export function useStockListFiltering(
  data: StockItem[] | undefined,
  searchTerm: string = '',
) {
  return useMemo(() => {
    if (!data || !searchTerm.trim()) return data || [];

    const term = searchTerm.toLowerCase();

    return data.filter((item) =>
      item.symbol.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term),
    );
  }, [data, searchTerm]);
}

/**
 * useStockListOperations - Combined sorting + filtering with memo
 * Chains both operations efficiently
 */
export function useStockListOperations(
  data: StockItem[] | undefined,
  searchTerm: string = '',
  sortBy: keyof StockItem | null = null,
  direction: SortDirection = 'desc',
) {
  // First filter
  const filtered = useStockListFiltering(data, searchTerm);

  // Then sort
  const sorted = useStockListSorting(filtered, sortBy, direction);

  return sorted;
}

/**
 * usePriceChangeColor - Memoized color function
 * Returns color class based on price change
 */
export function usePriceChangeColor(change: number) {
  return useMemo(() => {
    if (change > 0) return 'text-bull';
    if (change < 0) return 'text-bear';
    return 'text-slate-400';
  }, [change]);
}

/**
 * useTrendDirection - Memoized trend analysis
 * Returns trend direction for performance-critical renders
 */
export function useTrendDirection(changePercent: number) {
  return useMemo(() => {
    if (changePercent > 2) return 'strong-up';
    if (changePercent > 0) return 'up';
    if (changePercent < -2) return 'strong-down';
    if (changePercent < 0) return 'down';
    return 'neutral';
  }, [changePercent]);
}

/**
 * useSearchInputHandler - Memoized search callback
 * Prevents unnecessary re-renders in list components
 */
export function useSearchInputHandler(
  setSearchTerm: (term: string) => void,
) {
  return useCallback((value: string) => {
    setSearchTerm(value);
  }, [setSearchTerm]);
}

/**
 * useSortToggle - Memoized sort direction toggle
 * Efficiently toggles between asc/desc/null
 */
export function useSortToggle(
  currentDirection: SortDirection,
  currentField: keyof StockItem | null,
  targetField: keyof StockItem,
) {
  return useCallback(() => {
    if (currentField === targetField) {
      // Same field: cycle through directions
      if (currentDirection === 'asc') return 'desc';
      if (currentDirection === 'desc') return null;
      return 'asc';
    }
    // Different field: default to desc
    return 'desc';
  }, [currentDirection, currentField, targetField]);
}
