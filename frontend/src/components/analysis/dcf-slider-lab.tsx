'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, clamp } from '@/lib/utils';

interface DCFSliderLabProps {
  currentPrice?: number;
  baseGrowthRate?: number;
  baseWACC?: number;
  onCalculate?: (fairValue: number) => void;
}

/**
 * Interactive DCF Slider Lab
 * Growth Rate & WACC sliders with count-up animations on fair value
 */
export function DCFSliderLab({
  currentPrice = 1450,
  baseGrowthRate = 0.08,
  baseWACC = 0.095,
  onCalculate,
}: DCFSliderLabProps) {
  const [growthRate, setGrowthRate] = useState(baseGrowthRate);
  const [wacc, setWACC] = useState(baseWACC);
  const [displayFairValue, setDisplayFairValue] = useState(0);

  // Simple 2-stage DCF calculation
  const fairValue = useMemo(() => {
    const terminalGrowthRate = 0.025;
    const forecastYears = 5;
    const fcf = 1000; // Simplified FCF

    // Stage 1: Explicit forecast
    let pvExplicit = 0;
    for (let i = 1; i <= forecastYears; i++) {
      const fcfForecast = fcf * Math.pow(1 + growthRate, i);
      pvExplicit += fcfForecast / Math.pow(1 + wacc, i);
    }

    // Stage 2: Terminal value
    const terminalValue = (fcf * Math.pow(1 + growthRate, forecastYears) * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
    const pvTerminal = terminalValue / Math.pow(1 + wacc, forecastYears);

    return Math.round((pvExplicit + pvTerminal) * 100) / 100;
  }, [growthRate, wacc]);

  // Animate count-up
  const countUp = useMemo(() => {
    if (displayFairValue !== fairValue) {
      setTimeout(() => setDisplayFairValue(fairValue), 50);
    }
    return displayFairValue;
  }, [fairValue, displayFairValue]);

  const upside = currentPrice ? ((fairValue - currentPrice) / currentPrice) * 100 : 0;
  const upsideColor = upside > 0 ? 'text-bull' : 'text-bear';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-card space-y-6"
    >
      {/* Header */}
      <div>
        <h4 className="text-sm font-semibold text-slate-200">DCF Analysis Lab</h4>
        <p className="text-xs text-slate-400 mt-1">Interactive 2-stage valuation</p>
      </div>

      {/* Current Price */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5">
        <span className="text-xs text-slate-400">Current Price</span>
        <span className="font-mono font-semibold text-slate-100">
          {formatCurrency(currentPrice)}
        </span>
      </div>

      {/* Growth Rate Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Growth Rate (Explicit Period)
          </label>
          <motion.span
            key={growthRate}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-mono font-bold text-trust"
          >
            {(growthRate * 100).toFixed(2)}%
          </motion.span>
        </div>
        <input
          type="range"
          min="0"
          max="0.3"
          step="0.01"
          value={growthRate}
          onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full bg-slate-700/30 appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(14, 165, 233) 0%, rgb(14, 165, 233) ${(growthRate / 0.3) * 100}%, rgb(55, 65, 81) ${(growthRate / 0.3) * 100}%, rgb(55, 65, 81) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>30%</span>
        </div>
      </div>

      {/* WACC Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            WACC (Discount Rate)
          </label>
          <motion.span
            key={wacc}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-mono font-bold text-trust"
          >
            {(wacc * 100).toFixed(2)}%
          </motion.span>
        </div>
        <input
          type="range"
          min="0.05"
          max="0.2"
          step="0.01"
          value={wacc}
          onChange={(e) => setWACC(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full bg-slate-700/30 appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(14, 165, 233) 0%, rgb(14, 165, 233) ${((wacc - 0.05) / 0.15) * 100}%, rgb(55, 65, 81) ${((wacc - 0.05) / 0.15) * 100}%, rgb(55, 65, 81) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>5%</span>
          <span>20%</span>
        </div>
      </div>

      {/* Fair Value Result */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-gradient-to-r from-trust/10 to-bull/10 border border-white/5"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-400">Intrinsic Fair Value</span>
          <motion.span
            key={countUp}
            initial={{ scale: 1.1, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="stock-price text-trust"
          >
            {formatCurrency(countUp)}
          </motion.span>
        </div>
      </motion.div>

      {/* Upside/Downside */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-3 rounded-lg text-center ${upsideColor} border border-white/5`}
      >
        <p className="text-xs text-slate-400 mb-1">Potential Return</p>
        <p className="font-mono font-bold text-lg">
          {upside > 0 ? '+' : ''}{upside.toFixed(2)}%
        </p>
        {upside > 0 && (
          <p className="text-xs text-bull mt-1">↗ Upside opportunity</p>
        )}
        {upside < 0 && (
          <p className="text-xs text-bear mt-1">↘ Downside risk</p>
        )}
      </motion.div>
    </motion.div>
  );
}
