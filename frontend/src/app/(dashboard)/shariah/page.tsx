'use client';

import { motion } from 'framer-motion';
import { useShariaStatus, useNonCompliantStocks } from '@/hooks/useApi';
import { ShariaHardGateBadge } from '@/components/ui/shariah-badge';
import { AlertTriangle } from 'lucide-react';

/**
 * Shariah Compliance Scanner
 * 2026 SECP hard gates audit dashboard
 */
export default function ShariaPage() {
  const { data: summary, isLoading: summaryLoading } = useShariaStatus();
  const { data: nonCompliant, isLoading: ncLoading } = useNonCompliantStocks();

  return (
    <div className="p-8 bg-gradient-bloomberg min-h-screen space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-slate-100">Shariah Compliance</h1>
        <p className="text-slate-400 mt-2">2026 SECP hard gates audit for KMI-30</p>
      </motion.div>

      {/* Summary Stats */}
      {!summaryLoading && summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-slate-400">Total Companies</p>
            <p className="text-3xl font-bold text-slate-100 mt-2">{summary.total}</p>
          </div>

          <div className="glass-card p-6 text-center border-bull/30">
            <p className="text-sm text-bull">Compliant</p>
            <p className="text-3xl font-bold text-bull mt-2">{summary.compliant}</p>
          </div>

          <div className="glass-card p-6 text-center border-bear/30">
            <p className="text-sm text-bear">Non-Compliant</p>
            <p className="text-3xl font-bold text-bear mt-2">{summary.nonCompliant}</p>
          </div>

          <div className="glass-card p-6 text-center border-caution/30">
            <p className="text-sm text-caution">Flagged</p>
            <p className="text-3xl font-bold text-caution mt-2">{summary.flagged}</p>
          </div>
        </motion.div>
      )}

      {/* Compliance Rate */}
      {!summaryLoading && summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8"
        >
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Compliance Rate</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Portfolio Coverage</span>
              <span className="font-bold text-lg text-trust">{summary.complianceRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${typeof summary.complianceRate === 'string' ? parseInt(summary.complianceRate) : summary.complianceRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-trust to-bull"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Non-Compliant Companies Alert */}
      {!ncLoading && nonCompliant && nonCompliant.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6 border-2 border-bear/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-bear animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-100">Non-Compliant Companies</h2>
          </div>

          <div className="space-y-4">
            {nonCompliant.map((company) => (
              <ShariaHardGateBadge
                key={company.id}
                debtRatio={company.debtAssetsRatio}
                rating={company.complianceRating}
                showAlert={false}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* All Clear Message */}
      {!ncLoading && nonCompliant && nonCompliant.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-12 text-center"
        >
          <p className="text-3xl mb-4">✓</p>
          <h2 className="text-2xl font-bold text-bull mb-2">All Compliant</h2>
          <p className="text-slate-400">All KMI-30 companies meet the 2026 SECP hard gates criteria</p>
        </motion.div>
      )}
    </div>
  );
}
