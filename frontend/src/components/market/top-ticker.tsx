'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useKMI30 } from '@/hooks/useApi';
import { formatCurrency, formatPercentChange } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DataFreshnessIndicator } from '@/components/ui/DataFreshnessIndicator';

/**
 * AlphaBeat Ticker - 60fps Framer Motion marquee
 * - Scrolls live prices with dynamic color switching (emerald/rose)
 * - Includes data freshness indicator without layout shifts
 * - Click on ticker items to view stock details in dashboard
 */
export function TopTicker({ onSelectStock }: { onSelectStock?: (symbol: string) => void }) {
  const { data: companies, isLoading } = useKMI30();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update timestamp when data changes
  useEffect(() => {
    if (companies && companies.length > 0) {
      setLastUpdated(new Date());
    }
  }, [companies]);

  // Duplicate for seamless loop
  const tickerItems = useMemo(() => {
    if (!companies) return [];
    return [...companies, ...companies]; // Duplicate for infinite scroll effect
  }, [companies]);

  return (
    <div className="h-16 glass-sm border-b border-white/5 overflow-hidden flex items-center sticky top-0 z-10">
      {/* Ticker Title */}
      <div className="px-6 py-4 border-r border-white/10 flex-shrink-0 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
        <span className="text-sm font-semibold text-slate-300">LIVE</span>
      </div>

      {/* Marquee Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">Loading market data...</p>
          </div>
        ) : (
          <motion.div
            className="flex gap-8 px-6"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {tickerItems.map((company, idx) => (
              <TickerItem 
                key={`${company.symbol}-${idx}`} 
                company={company} 
                onSelectStock={onSelectStock}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Data Freshness Indicator - No layout shift */}
      <div className="px-6 flex-shrink-0 border-l border-white/10">
        <DataFreshnessIndicator lastUpdated={lastUpdated} updateInterval={1000} />
      </div>
    </div>
  );
}

interface TickerItemProps {
  company: any;
  onSelectStock?: (symbol: string) => void;
}

function TickerItem({ company, onSelectStock }: TickerItemProps) {
  const isPositive = company.change >= 0;
  const colorClass = isPositive ? 'text-bull' : 'text-bear';
  const bgColorClass = isPositive ? 'bg-bull/5' : 'bg-bear/5';

  return (
    <motion.div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg
        ${bgColorClass} whitespace-nowrap flex-shrink-0
        hover:bg-slate-800/30 transition-all cursor-pointer
        hover:shadow-lg hover:shadow-${isPositive ? 'bull' : 'bear'}/20
      `}
      whileHover={{ scale: 1.05 }}
      onClick={() => onSelectStock?.(company.symbol)}
    >
      {/* Symbol */}
      <span className="font-mono font-bold text-sm text-slate-100 w-16">
        {company.symbol}
      </span>

      {/* Price */}
      <span className="font-mono font-semibold text-slate-200">
        {formatCurrency(company.price)}
      </span>

      {/* Change % with icon */}
      <div className={`flex items-center gap-1 ${colorClass}`}>
        {isPositive ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingDown size={14} />
        )}
        <span className="font-mono text-sm font-semibold">
          {formatPercentChange(company.change / 100)}
        </span>
      </div>
    </motion.div>
  );
}
