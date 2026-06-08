'use client';

import { motion } from 'framer-motion';
import { useSystemHealth } from '@/hooks/useApi';
import { formatTime } from '@/lib/utils';

/**
 * Admin Pulse Widget
 * System status using glowing orbs (Green/Red)
 * Shows /health ping latency from NestJS backend
 */
export function AdminPulseWidget() {
  const { data: health, isLoading } = useSystemHealth();

  if (isLoading || !health) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-32">
        <p className="text-sm text-slate-400">Loading system health...</p>
      </div>
    );
  }

  const isHealthy = health.status === 'HEALTHY';
  const dbConnected = health.database === 'CONNECTED';
  const geminiOnline = health.gemini.status === 'ONLINE';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 space-y-4"
    >
      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-200">System Health</h4>

      {/* Status Orbs */}
      <div className="space-y-3">
        {/* Database Status */}
        <StatusOrb
          label="Database"
          isOnline={dbConnected}
          latency={undefined}
        />

        {/* Gemini Status */}
        <StatusOrb
          label="Gemini AI"
          isOnline={geminiOnline}
          latency={health.gemini.latency}
        />

        {/* Overall Status */}
        <StatusOrb
          label="System"
          isOnline={isHealthy}
          latency={undefined}
        />
      </div>

      {/* Timestamp */}
      <div className="text-xs text-slate-500 pt-3 border-t border-white/5">
        <p>Last updated: {formatTime(health.timestamp, 'time')}</p>
      </div>
    </motion.div>
  );
}

interface StatusOrbProps {
  label: string;
  isOnline: boolean;
  latency?: number;
}

function StatusOrb({ label, isOnline, latency }: StatusOrbProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Glowing Orb */}
      <motion.div className="relative">
        {/* Outer glow */}
        <motion.div
          animate={{
            boxShadow: isOnline
              ? [
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                  '0 0 30px rgba(16, 185, 129, 0.5)',
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                ]
              : [
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                  '0 0 30px rgba(239, 68, 68, 0.5)',
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-2 rounded-full"
        />

        {/* Inner orb */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`
            relative w-4 h-4 rounded-full
            ${isOnline ? 'bg-bull' : 'bg-bear'}
          `}
        />
      </motion.div>

      {/* Label & Status */}
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          {latency !== undefined && (
            <span className="text-xs font-mono text-slate-400">
              {latency}ms
            </span>
          )}
          <span className={`text-xs font-semibold ${isOnline ? 'text-bull' : 'text-bear'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
