'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useKMI30 } from '@/hooks/useApi';
import {
  useStockListOperations,
  usePriceChangeColor,
  useSearchInputHandler,
  type SortDirection,
} from '@/hooks/useListOptimization';
import { formatCurrency, formatPercentChange } from '@/lib/utils';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import type { KMI30Company } from '@/types/api';

interface StockDataTableProps {
  onSelectStock?: (symbol: string) => void;
}

/**
 * Searchable stock data table with performance optimization
 * - useMemo for filtering/sorting to prevent unnecessary re-renders
 * - useCallback for event handlers
 * - Memoized StockRow component
 */
export function StockDataTable({ onSelectStock }: StockDataTableProps) {
  const { data: companies, isLoading, error } = useKMI30();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof KMI30Company | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // ✅ Memoized search handler prevents re-renders on parent
  const handleSearchChange = useSearchInputHandler(setSearchTerm);

  // ✅ Memoized sort toggle callback
  const handleSort = useCallback(
    (field: keyof KMI30Company) => {
      if (sortBy === field) {
        // Same field: cycle through directions
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else if (sortDirection === 'desc') {
          setSortDirection(null);
          setSortBy(null);
        } else {
          setSortDirection('asc');
        }
      } else {
        // Different field: default to desc
        setSortBy(field);
        setSortDirection('desc');
      }
    },
    [sortBy, sortDirection],
  );

  // ✅ Memoized filtering + sorting (chains both operations)
  const filteredAndSorted = useStockListOperations(
    companies as any,
    searchTerm,
    sortBy,
    sortDirection,
  );

  return (
    <div className="flex flex-col h-full bg-gradient-bloomberg rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 glass-sm">
        <h3 className="text-lg font-semibold text-slate-100 mb-3">KMI-30 Index</h3>

        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full glass-input pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Loading market data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-bear">
            <p>Error loading data</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="border-b border-white/5 bg-slate-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">
                  Rank
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-300 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol {sortBy === 'symbol' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-300 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('price')}
                >
                  Price {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-slate-300 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('change')}
                >
                  Change {sortBy === 'change' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((company, idx) => (
                <MemoizedStockRow
                  key={company.symbol}
                  company={company}
                  index={idx}
                  onClick={() => onSelectStock?.(company.symbol)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

interface StockRowProps {
  company: KMI30Company;
  index: number;
  onClick?: () => void;
}

function StockRow({ company, index, onClick }: StockRowProps) {
  const isPositive = company.change >= 0;
  const changeColor = usePriceChangeColor(company.change);
  const changeBg = isPositive ? 'bg-bull/5' : 'bg-bear/5';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`
        border-b border-slate-900/50 hover:bg-slate-800/30 transition-colors
        cursor-pointer group
      `}
    >
      {/* Rank */}
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-slate-400 group-hover:text-slate-300">
          #{company.ranking}
        </span>
      </td>

      {/* Symbol */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="stock-symbol text-trust group-hover:text-sky-300">
            {company.symbol}
          </span>
          <span className="text-xs text-slate-400 line-clamp-1">
            {company.name}
          </span>
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <span className="font-mono font-semibold text-slate-100">
          {formatCurrency(company.price)}
        </span>
      </td>

      {/* Change % */}
      <td className={`px-4 py-3 text-right ${changeColor}`}>
        <div className="flex items-center justify-end gap-1">
          {isPositive ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          <span className="font-mono font-semibold">
            {formatPercentChange(company.change / 100)}
          </span>
        </div>
      </td>

      {/* Shariah Status */}
      <td className="px-4 py-3 text-right">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`
            inline-block px-2 py-1 rounded text-xs font-semibold
            ${company.shariaStatus === '✓' ? 'text-bull' : 'text-bear'}
          `}
        >
          {company.shariaStatus === '✓' ? '✓' : '🔴'}
        </motion.div>
      </td>
    </motion.tr>
  );
}

/**
 * Memoized StockRow - Prevents unnecessary re-renders
 * Only updates when company data changes
 */
const MemoizedStockRow = memo(StockRow, (prevProps, nextProps) => {
  return (
    prevProps.company.symbol === nextProps.company.symbol &&
    prevProps.company.price === nextProps.company.price &&
    prevProps.company.change === nextProps.company.change &&
    prevProps.index === nextProps.index
  );
});
