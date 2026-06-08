'use client';

import { motion } from 'framer-motion';
import { useSystemHealth, useGeminiPing } from '@/hooks/useApi';
import { AdminPulseWidget } from '@/components/admin/pulse-widget';
import { useState } from 'react';

/**
 * System Health Monitoring Dashboard
 */
export default function HealthPage() {
  const { data: health, isLoading } = useSystemHealth();
  const [pingGemini, setPingGemini] = useState(false);
  const geminiPing = useGeminiPing(pingGemini);

  return (
    <div className="p-8 bg-gradient-bloomberg min-h-screen space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-slate-100">System Health Monitor</h1>
        <p className="text-slate-400 mt-2">Real-time service status and performance metrics</p>
      </motion.div>

      {/* Main Health Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-md"
      >
        <AdminPulseWidget />
      </motion.div>

      {/* Detailed Status */}
      {!isLoading && health && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Service Status</h2>

          <div className="space-y-4">
            {/* Overall Status */}
            <div className="p-4 rounded-lg bg-slate-800/20 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Overall System</span>
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      health.status === 'HEALTHY'
                        ? 'bg-bull/20 text-bull'
                        : health.status === 'DEGRADED'
                        ? 'bg-caution/20 text-caution'
                        : 'bg-bear/20 text-bear'
                    }
                  `}
                >
                  {health.status}
                </span>
              </div>
            </div>

            {/* Database */}
            <div className="p-4 rounded-lg bg-slate-800/20 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300">Database</p>
                  <p className="text-xs text-slate-500">PostgreSQL connection</p>
                </div>
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm font-semibold
                    ${health.database === 'CONNECTED' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'}
                  `}
                >
                  {health.database}
                </span>
              </div>
            </div>

            {/* Gemini AI */}
            <div className="p-4 rounded-lg bg-slate-800/20 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-slate-300">Gemini AI</p>
                  <p className="text-xs text-slate-500">generativelanguage.googleapis.com</p>
                </div>
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      health.gemini.status === 'ONLINE'
                        ? 'bg-bull/20 text-bull'
                        : health.gemini.status === 'DEGRADED'
                        ? 'bg-caution/20 text-caution'
                        : 'bg-bear/20 text-bear'
                    }
                  `}
                >
                  {health.gemini.status}
                </span>
              </div>

              {health.gemini.latency !== undefined && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Latency</span>
                  <span className="font-mono">{health.gemini.latency}ms</span>
                </div>
              )}

              {/* Gemini Ping Button */}
              <button
                onClick={() => setPingGemini(!pingGemini)}
                className="mt-3 w-full px-3 py-2 rounded text-xs font-semibold bg-trust/20 hover:bg-trust/30 text-trust transition-colors"
              >
                {geminiPing.isPending ? 'Pinging...' : 'Test Gemini Connection'}
              </button>

              {geminiPing.data && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-slate-400"
                >
                  {geminiPing.data.message}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Last Updated */}
      {!isLoading && health && (
        <div className="text-xs text-slate-500 text-center">
          <p>Last updated: {new Date(health.timestamp).toLocaleString('en-PK')}</p>
          <p className="mt-1">Auto-refreshing every 30 seconds</p>
        </div>
      )}
    </div>
  );
}
