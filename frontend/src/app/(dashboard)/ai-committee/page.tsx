'use client';

import { motion } from 'framer-motion';
import { useKMI30, useMemo } from '@/hooks/useApi';
import { IntelligenceMemo } from '@/components/memo/intelligence-memo';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

/**
 * AI Committee - View AI memos for all KMI-30 stocks
 */
export default function AICommitteePage() {
  const { data: companies, isLoading } = useKMI30();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-bloomberg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-screen">
        {/* Stock List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 glass-card overflow-y-auto"
        >
          <div className="p-6 border-b border-white/5 sticky top-0 bg-gradient-bloomberg">
            <h2 className="text-xl font-bold text-slate-100">AI Committee</h2>
            <p className="text-xs text-slate-400 mt-1">12-section institutional memos</p>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-slate-400">
              <p>Loading KMI-30...</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {companies?.map((company) => (
                <motion.button
                  key={company.symbol}
                  onClick={() => setSelectedSymbol(company.symbol)}
                  className={`
                    w-full p-4 text-left transition-colors duration-200
                    ${
                      selectedSymbol === company.symbol
                        ? 'bg-trust/10 border-l-2 border-trust'
                        : 'hover:bg-slate-800/20'
                    }
                  `}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-100">{company.symbol}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{company.name}</p>
                    </div>
                    <span className={`text-xs font-semibold ${company.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {company.change >= 0 ? '+' : ''}{company.change.toFixed(2)}%
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Memo Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 overflow-y-auto"
        >
          <AnimatePresence mode="wait">
            {selectedSymbol ? (
              <motion.div
                key={selectedSymbol}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <IntelligenceMemo symbol={selectedSymbol} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 flex flex-col items-center justify-center h-full gap-4"
              >
                <span className="text-5xl">🤖</span>
                <h2 className="text-2xl font-bold text-slate-200">AI Committee</h2>
                <p className="text-slate-400 text-center">
                  Select a stock to view its Gemini-powered intelligence memo.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
