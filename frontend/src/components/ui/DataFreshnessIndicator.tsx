'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DataFreshnessIndicatorProps {
  lastUpdated: Date | null;
  updateInterval?: number; // in ms
}

/**
 * Data Freshness Indicator
 * Shows time since last update without causing layout shifts
 * Fixed width design to prevent reflow
 */
export function DataFreshnessIndicator({
  lastUpdated,
  updateInterval = 1000,
}: DataFreshnessIndicatorProps) {
  const [timeago, setTimeago] = useState<string>('just now');
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeago = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();

      // Calculate human-readable time difference
      if (diff < 10000) {
        setTimeago('just now');
        setIsStale(false);
      } else if (diff < 60000) {
        const seconds = Math.floor(diff / 1000);
        setTimeago(`${seconds}s ago`);
        setIsStale(false);
      } else if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        setTimeago(`${minutes}m ago`);
        setIsStale(minutes > 5); // Stale if > 5 minutes
      } else {
        const hours = Math.floor(diff / 3600000);
        setTimeago(`${hours}h ago`);
        setIsStale(true); // Always stale if > 1 hour
      }
    };

    updateTimeago();
    const interval = setInterval(updateTimeago, updateInterval);

    return () => clearInterval(interval);
  }, [lastUpdated, updateInterval]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800/40 border border-white/10"
    >
      {/* Status Dot */}
      <motion.div
        animate={isStale ? {} : { scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`
          w-2 h-2 rounded-full
          ${isStale ? 'bg-caution' : 'bg-bull'}
        `}
      />

      {/* Time Label (Fixed Width) */}
      <span className="text-xs font-mono text-slate-400 w-16">
        {timeago}
      </span>

      {/* Stale Indicator */}
      {isStale && (
        <span className="text-xs font-semibold text-caution">⚠️</span>
      )}
    </motion.div>
  );
}
