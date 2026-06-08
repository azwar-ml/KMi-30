'use client';

import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface MacroRiskMatrixProps {
  data?: MacroRiskData[];
}

interface MacroRiskData {
  category: string;
  risk: number; // 0-10
  fill?: string;
}

/**
 * Macro Risk Matrix - Recharts Radar chart
 * Shows macro risk factors (interest rate, inflation, FX, political, credit)
 */
export function MacroRiskMatrix({ data }: MacroRiskMatrixProps) {
  const defaultData: MacroRiskData[] = [
    { category: 'Interest Rate', risk: 6, fill: '#f59e0b' },
    { category: 'Inflation', risk: 5, fill: '#ef4444' },
    { category: 'FX Risk', risk: 7, fill: '#f59e0b' },
    { category: 'Political', risk: 4, fill: '#10b981' },
    { category: 'Credit Risk', risk: 6, fill: '#0ea5e9' },
  ];

  const chartData = data || defaultData;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-card space-y-4"
    >
      {/* Header */}
      <div>
        <h4 className="text-sm font-semibold text-slate-200">Macro Risk Matrix</h4>
        <p className="text-xs text-slate-400 mt-1">5-factor risk assessment</p>
      </div>

      {/* Radar Chart */}
      <div className="h-80 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            {/* Grid */}
            <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />

            {/* Angle Axis (Categories) */}
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />

            {/* Radius Axis (0-10 scale) */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />

            {/* Radar Data */}
            <Radar
              name="Risk Level"
              dataKey="risk"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.3}
              isAnimationActive={true}
              animationDuration={1000}
              dot={{
                fill: '#0ea5e9',
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: '#06b6d4',
              }}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: any) => [`${value}/10`, 'Risk']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Legend */}
      <div className="space-y-2 p-3 rounded-lg bg-slate-800/20 border border-white/5">
        <p className="text-xs font-semibold text-slate-300">Risk Levels</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-bull" />
            <span className="text-slate-400">Low: 0-3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-caution" />
            <span className="text-slate-400">Medium: 4-6</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-bear" />
            <span className="text-slate-400">High: 7-10</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-3 rounded-lg bg-caution/5 border border-caution/20 text-xs text-slate-300"
      >
        <p className="font-semibold text-caution mb-1">⚠ Focus Areas</p>
        <ul className="space-y-1 text-slate-400">
          <li>• FX volatility remains elevated (7/10)</li>
          <li>• Interest rate cycle inflecting higher</li>
          <li>• Political stability supportive for markets</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
