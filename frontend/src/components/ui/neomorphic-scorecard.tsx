'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NeomorphicScorecardProps {
  label: string;
  value: number; // 0-10
  description?: string;
  symbol?: string;
}

/**
 * Radial progress gauge (0-10) with glowing gradient
 * Color: Red -> Yellow -> Green based on value
 */
export function NeomorphicScorecard({
  label,
  value,
  description,
  symbol,
}: NeomorphicScorecardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate count-up
  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  // Calculate color based on value
  const getColor = (val: number) => {
    if (val < 3) return { start: '#ef4444', end: '#dc2626' }; // Red
    if (val < 7) return { start: '#f59e0b', end: '#d97706' }; // Yellow/Amber
    return { start: '#10b981', end: '#059669' }; // Green
  };

  const colors = getColor(displayValue);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayValue / 10) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-card flex flex-col items-center gap-4 p-6"
    >
      {/* Radial Gauge */}
      <div className="relative w-32 h-32">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="rgba(51, 65, 85, 0.2)"
            strokeWidth="8"
            fill="none"
          />

          {/* Animated Progress Circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            stroke={`url(#gradient-${displayValue})`}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${colors.start}80)`,
            }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient
              id={`gradient-${displayValue}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={displayValue}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-slate-100">
              {displayValue.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400">/10</div>
          </motion.div>
        </div>
      </div>

      {/* Label & Description */}
      <div className="text-center">
        <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
        {symbol && (
          <p className="text-xs text-trust font-mono mt-2">{symbol}</p>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-xs text-center text-slate-400">
        {displayValue < 3 && '🔴 Poor'}
        {displayValue >= 3 && displayValue < 7 && '🟡 Moderate'}
        {displayValue >= 7 && '✓ Strong'}
      </div>
    </motion.div>
  );
}
