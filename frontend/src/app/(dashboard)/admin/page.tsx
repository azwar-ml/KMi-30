'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminPulseWidget } from '@/components/admin/pulse-widget';
import {
  useSyncLivePrices,
  useSyncHistorical,
  useSyncPSXHeader,
  useAuditShariah,
  useScraperLogs,
  useLatencyLogs,
} from '@/hooks/useApi';
import { Loader } from 'lucide-react';

/**
 * Admin Control Panel
 * Sync operations, system health, and audit logs
 */
export default function AdminPage() {
  const [showLogs, setShowLogs] = useState(false);

  // Mutations
  const syncLive = useSyncLivePrices();
  const syncHistorical = useSyncHistorical();
  const syncPSXHeader = useSyncPSXHeader();
  const auditShariah = useAuditShariah();

  // Queries
  const scraperLogs = useScraperLogs(showLogs);
  const latencyLogs = useLatencyLogs(showLogs);

  return (
    <div className="p-8 bg-gradient-bloomberg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-100">Admin Control Panel</h1>
          <p className="text-slate-400 mt-2">System operations and monitoring</p>
        </div>

        {/* System Health Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm"
        >
          <AdminPulseWidget />
        </motion.div>

        {/* Sync Operations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-slate-100">Data Sync Operations</h2>
          <p className="text-sm text-slate-400">
            Manually trigger data synchronization from external sources
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sync Live Prices */}
            <button
              onClick={() => syncLive.mutate()}
              disabled={syncLive.isPending}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  syncLive.isPending
                    ? 'border-trust/50 bg-trust/5 text-trust'
                    : 'border-trust/20 bg-slate-800/20 hover:bg-slate-800/40 text-slate-100'
                }
              `}
            >
              <div className="flex items-center gap-2 justify-center">
                {syncLive.isPending && <Loader size={18} className="animate-spin" />}
                <span className="font-semibold">Sync Live Prices</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">From psx-api-py</p>
            </button>

            {/* Sync Historical */}
            <button
              onClick={() => syncHistorical.mutate()}
              disabled={syncHistorical.isPending}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  syncHistorical.isPending
                    ? 'border-trust/50 bg-trust/5 text-trust'
                    : 'border-trust/20 bg-slate-800/20 hover:bg-slate-800/40 text-slate-100'
                }
              `}
            >
              <div className="flex items-center gap-2 justify-center">
                {syncHistorical.isPending && <Loader size={18} className="animate-spin" />}
                <span className="font-semibold">Sync Historical (365d)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">From psxdata API</p>
            </button>

            {/* Sync PSX Header */}
            <button
              onClick={() => syncPSXHeader.mutate()}
              disabled={syncPSXHeader.isPending}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  syncPSXHeader.isPending
                    ? 'border-bull/50 bg-bull/5 text-bull'
                    : 'border-bull/20 bg-slate-800/20 hover:bg-slate-800/40 text-slate-100'
                }
              `}
            >
              <div className="flex items-center gap-2 justify-center">
                {syncPSXHeader.isPending && <Loader size={18} className="animate-spin" />}
                <span className="font-semibold">Sync KMI-30 Index</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">From PSX DPS ZIP</p>
            </button>

            {/* Audit Shariah */}
            <button
              onClick={() => auditShariah.mutate()}
              disabled={auditShariah.isPending}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  auditShariah.isPending
                    ? 'border-caution/50 bg-caution/5 text-caution'
                    : 'border-caution/20 bg-slate-800/20 hover:bg-slate-800/40 text-slate-100'
                }
              `}
            >
              <div className="flex items-center gap-2 justify-center">
                {auditShariah.isPending && <Loader size={18} className="animate-spin" />}
                <span className="font-semibold">Audit Shariah</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">2026 SECP gates</p>
            </button>
          </div>
        </motion.div>

        {/* Logs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="glass-card p-4 w-full text-left hover:bg-slate-800/30 transition-colors"
          >
            <h2 className="text-lg font-semibold text-slate-100">
              {showLogs ? '▼' : '▶'} View Logs
            </h2>
          </button>

          {showLogs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6 mt-4 space-y-6"
            >
              {/* Scraper Logs */}
              <div>
                <h3 className="font-semibold text-slate-200 mb-3">Scraper Activity</h3>
                {scraperLogs.isLoading ? (
                  <p className="text-slate-400">Loading logs...</p>
                ) : scraperLogs.data && scraperLogs.data.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scraperLogs.data.map((log) => (
                      <div key={log.id} className="text-xs p-2 rounded bg-slate-800/20 text-slate-300">
                        <p>
                          <span className="font-mono">{log.source}</span> - {log.status} (
                          {log.recordsFetched} records)
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No logs</p>
                )}
              </div>

              {/* Latency Logs */}
              <div>
                <h3 className="font-semibold text-slate-200 mb-3">API Latency</h3>
                {latencyLogs.isLoading ? (
                  <p className="text-slate-400">Loading logs...</p>
                ) : latencyLogs.data && latencyLogs.data.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {latencyLogs.data.slice(0, 10).map((log) => (
                      <div key={log.id} className="text-xs p-2 rounded bg-slate-800/20 text-slate-300">
                        <p>
                          <span className="font-mono">{log.method}</span> {log.endpoint} - {log.latency}ms
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No logs</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
