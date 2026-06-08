'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { useAllCompanies } from '@/hooks/useApi';
import { formatCurrency, formatPercentChange } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { KMI30Company } from '@/types/api';

/**
 * Markets page - Expanded view with all PSX companies
 * - Search functionality across all tickers
 * - Load More / Pagination
 * - Real-time price updates
 */
export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const PAGE_SIZE = 20;

  const { data: allData, isLoading, error } = useAllCompanies(0, displayCount, searchTerm);

  // Debounce search
  const debouncedSearch = useMemo(() => {
    const handler = setTimeout(() => {
      // Search is already handled by the hook's queryKey
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const companies = allData?.data || [];
  const total = allData?.total || 0;
  const hasMore = allData?.hasMore !== false;

  return (
    <div className="p-8 bg-gradient-bloomberg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100">PSX Market Overview</h1>
          <p className="text-slate-400 mt-2">
            {total > 0 ? `${total} total stocks` : 'Loading market data...'}
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by symbol or company name... (e.g., UNITY, HBL)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-12 py-3 text-slate-100 placeholder-slate-400"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl overflow-hidden border border-white/5"
        >
          {isLoading && companies.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-trust animate-spin" />
                <p className="text-slate-400">Loading market data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-bear">
              <p>Error loading market data</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <p>No stocks found matching your search</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">
                        Symbol
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">
                        Sector
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">
                        Price
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300">
                        Change
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company: any, idx: number) => {
                      const isPositive = company.change >= 0;
                      const changeColor = isPositive ? 'text-bull' : 'text-bear';
                      const rowBg = isPositive ? 'hover:bg-bull/5' : 'hover:bg-bear/5';

                      return (
                        <motion.tr
                          key={company.symbol}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className={`border-b border-slate-900/50 ${rowBg} transition-colors cursor-pointer group`}
                        >
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono text-slate-400 group-hover:text-slate-300">
                              {company.ranking || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="stock-symbol text-trust group-hover:text-sky-300 font-semibold">
                              {company.symbol}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-slate-200 line-clamp-1">
                                {company.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-400">{company.sector}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-slate-100">
                              {formatCurrency(company.price)}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right ${changeColor}`}>
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
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-semibold">{company.shariaStatus}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="px-6 py-6 border-t border-white/5 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDisplayCount(displayCount + PAGE_SIZE)}
                    disabled={isLoading}
                    className="px-8 py-3 rounded-lg glass-sm border border-white/10 text-slate-200 hover:text-slate-100 transition-all flex items-center gap-2 hover:border-white/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Load More ({companies.length} of {total})
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* Footer Info */}
              {!hasMore && companies.length > 0 && (
                <div className="px-6 py-4 border-t border-white/5 text-center text-slate-400 text-sm">
                  Showing all {companies.length} stocks
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
