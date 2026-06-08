'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global App Error Boundary
 * "Terminal Connection Lost" UI with retry functionality
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-bloomberg flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated error orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-bear/10 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-caution/10 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      {/* Error Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8 space-y-6 rounded-2xl border-2 border-bear/30">
          {/* Error Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <div className="p-4 rounded-full bg-bear/20 border-2 border-bear/30">
              <AlertTriangle size={32} className="text-bear" />
            </div>
          </motion.div>

          {/* Title & Message */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-slate-100">Terminal Connection Lost</h1>
            <p className="text-slate-400">
              An unexpected error occurred. The system is attempting to recover.
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-bear/5 border border-bear/20"
            >
              <p className="text-xs text-bear font-mono break-words">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 mt-2">
                  Digest: {error.digest.substring(0, 20)}...
                </p>
              )}
            </motion.div>
          )}

          {/* Retry Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300
              flex items-center justify-center gap-2
              bg-gradient-to-r from-trust via-bull to-trust hover:shadow-glow-trust text-white
            `}
          >
            <RotateCcw size={18} />
            Re-establish Link
          </motion.button>

          {/* Status Message */}
          <p className="text-xs text-slate-500 text-center">
            If the problem persists, please refresh the page or contact support.
          </p>
        </div>

        {/* Status Indicator */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center gap-2 mt-6 text-sm text-bear"
        >
          <div className="w-2 h-2 rounded-full bg-bear animate-pulse" />
          Connection Error
        </motion.div>
      </motion.div>
    </div>
  );
}
