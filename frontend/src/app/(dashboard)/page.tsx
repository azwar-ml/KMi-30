'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StockDataTable } from '@/components/market/stock-data-table';
import { IntelligenceMemo } from '@/components/memo/intelligence-memo';
import { DCFSliderLab } from '@/components/analysis/dcf-slider-lab';
import { MacroRiskMatrix } from '@/components/analysis/macro-risk-matrix';
import { NeomorphicScorecard } from '@/components/ui/neomorphic-scorecard';
import { ShariaHardGateBadge } from '@/components/ui/shariah-badge';
import { useStockDetails } from '@/hooks/useApi';

/**
 * 3-Column Command Center Dashboard
 * - Column 1 (20%): Market Feed (Stock Data Table)
 * - Column 2 (45%): Main Viewport (12-Section Intelligence Memo)
 * - Column 3 (20%): Analysis Lab (DCF Slider + Macro Risk Matrix)
 */
export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const { data: stockDetails } = useStockDetails(selectedSymbol);

  return (
    <div className="h-full bg-gradient-bloomberg">
      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 h-full">
        {/* COLUMN 1: Market Feed (20%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 min-h-screen overflow-y-auto"
        >
          <StockDataTable onSelectStock={setSelectedSymbol} />
        </motion.div>

        {/* COLUMN 2: Intelligence Memo (45%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-5 min-h-screen overflow-y-auto"
        >
          <AnimatePresence mode="wait">
            {selectedSymbol ? (
              <motion.div
                key={selectedSymbol}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <IntelligenceMemo symbol={selectedSymbol} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-12 flex flex-col items-center justify-center h-96 gap-4"
              >
                <div className="w-16 h-16 rounded-full glass-sm flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Select a Stock</h3>
                <p className="text-sm text-slate-400 text-center">
                  Choose a company from the KMI-30 index to view its intelligence memo.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* COLUMN 3: Analysis Lab (35%) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-5 space-y-4 min-h-screen overflow-y-auto"
        >
          {selectedSymbol && stockDetails ? (
            <>
              {/* Scorecard */}
              <NeomorphicScorecard
                label="Valuation Score"
                value={7.2}
                description="Fair value assessment"
                symbol={selectedSymbol}
              />

              {/* Shariah Compliance */}
              <ShariaHardGateBadge
                debtRatio={stockDetails.fundamentals.debtToAssets}
                rating={4}
                showAlert={true}
              />

              {/* DCF Lab */}
              <DCFSliderLab
                currentPrice={stockDetails.fundamentals.marketCap}
                baseGrowthRate={0.08}
                baseWACC={0.095}
              />

              {/* Macro Risk Matrix */}
              <MacroRiskMatrix />
            </>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center h-96 gap-4">
              <div className="w-12 h-12 rounded-full glass-sm flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Analysis Panel</h3>
              <p className="text-xs text-slate-400 text-center">
                Select a stock to view analysis tools and insights.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
