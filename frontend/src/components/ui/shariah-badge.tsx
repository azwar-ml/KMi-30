'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getShariaStatus } from '@/lib/utils';

interface ShariaHardGateBadgeProps {
  debtRatio: number | null | undefined;
  rating: number;
  showAlert?: boolean;
}

/**
 * Shariah Hard-Gate Badge
 * Displays 5-star rating with 🔴 alert if Debt/Assets > 33%
 * Triggers red border glow on page if non-compliant
 */
export function ShariaHardGateBadge({
  debtRatio,
  rating,
  showAlert = false,
}: ShariaHardGateBadgeProps) {
  const { isCompliant, message, color } = getShariaStatus(debtRatio);

  // Trigger page-level alert
  if (!isCompliant && showAlert) {
    // This would be handled by a provider/context at page level
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        glass-card p-4 border-2 transition-all duration-300
        ${isCompliant ? 'border-bull/30' : 'border-bear/50 shadow-glow'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-200">Shariah Compliance</h4>
        {isCompliant ? (
          <CheckCircle2 size={18} className="text-bull" />
        ) : (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <AlertTriangle size={18} className="text-bear" />
          </motion.div>
        )}
      </div>

      {/* Status Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-sm font-semibold mb-3 ${color}`}
      >
        {message}
      </motion.p>

      {/* 5-Star Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: star <= rating ? 1 : 0.3, scale: 1 }}
            transition={{ delay: star * 0.1 }}
            className={`
              w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
              ${
                star <= rating
                  ? 'bg-bull/20 text-bull'
                  : 'bg-slate-800/30 text-slate-600'
              }
            `}
          >
            ★
          </motion.div>
        ))}
      </div>

      {/* Debt Ratio Info */}
      {debtRatio !== null && debtRatio !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-slate-400 space-y-1"
        >
          <div className="flex justify-between">
            <span>Debt/Assets:</span>
            <span className="font-mono font-semibold text-slate-200">
              {(debtRatio * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Threshold:</span>
            <span className="font-mono text-bull">&lt;33%</span>
          </div>
          {!isCompliant && (
            <motion.div
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-bear text-xs font-semibold pt-2"
            >
              ⚠ Breach detected
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Alert Animation - Page-level glow */}
      <AnimatePresence>
        {!isCompliant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-px rounded-xl bg-gradient-to-r from-bear/20 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
