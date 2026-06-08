'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/sidebar';
import { TopTicker } from '@/components/market/top-ticker';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StockDataTable } from '@/components/market/stock-data-table';
import { IntelligenceMemo } from '@/components/memo/intelligence-memo';
import { DCFSliderLab } from '@/components/analysis/dcf-slider-lab';
import { MacroRiskMatrix } from '@/components/analysis/macro-risk-matrix';
import { useStockDetails } from '@/hooks/useApi';

/**
 * Root page - Shows dashboard if authenticated, redirects to login otherwise
 */
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const { data: stockDetails } = useStockDetails(selectedSymbol);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bloomberg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-trust rounded-full" />
          </div>
          <p className="text-slate-400">Initializing KMI-30 Alpha...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gradient-bloomberg">
        {/* Left Sidebar - Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Ticker Ribbon */}
          <TopTicker onSelectStock={setSelectedSymbol} />

          {/* Main Viewport */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full bg-gradient-bloomberg">
              {/* 3-Column Layout - Bloomberg Style */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 h-full">
                {/* COLUMN 1: Market Feed (Left) - 25% width */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-3 h-full overflow-y-auto"
                >
                  <StockDataTable onSelectStock={setSelectedSymbol} />
                </motion.div>

                {/* COLUMN 2: Intelligence Memo (Center) - 37% width */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="lg:col-span-4 h-full overflow-y-auto"
                >
                  <AnimatePresence mode="wait">
                    {selectedSymbol ? (
                      <IntelligenceMemo symbol={selectedSymbol} details={stockDetails} />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-slate-900/20 rounded-xl">
                        <p className="text-slate-500 text-center px-4">
                          👈 Select a stock from the left panel to view analysis
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* COLUMN 3: Analysis Lab (Right) - 38% width */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-5 h-full overflow-y-auto space-y-4 flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto">
                    <DCFSliderLab symbol={selectedSymbol} />
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <MacroRiskMatrix symbol={selectedSymbol} />
                  </div>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
