'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ChartOptions,
  SeriesMarkers,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from 'lightweight-charts';
import { motion } from 'framer-motion';

interface CandleData {
  time: string; // Format: "2024-05-18" or timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandleData[];
  symbol?: string;
  height?: number;
  onReady?: () => void;
}

/**
 * Institutional Candlestick Chart Component
 * - Transparent background
 * - 60fps rendering with ResizeObserver
 * - Proper cleanup on unmount to prevent memory leaks
 * - Bloomberg-style color scheme (emerald up, rose down)
 */
export function CandlestickChart({
  data,
  symbol = 'KMI-30',
  height = 500,
  onReady,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Initialize chart with zero-memory-leak guarantee
  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart with transparent background
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: '#cbd5e1',
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 0, // Disabled
        },
        grid: {
          horzLines: {
            color: 'rgba(255, 255, 255, 0.05)',
            visible: false,
          },
          vertLines: {
            color: 'rgba(255, 255, 255, 0.05)',
            visible: false,
          },
        },
        rightPriceScale: {
          textColor: '#94a3b8',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
        timeScale: {
          textColor: '#94a3b8',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
      } as ChartOptions);

      // Add candlestick series
      const series = chart.addCandlestickSeries({
        upColor: '#10b981', // Emerald - Bull (Up)
        downColor: '#ef4444', // Rose - Bear (Down)
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
        lastPriceAnimation: 1, // Smooth animation
      });

      // Convert data to chart format
      const chartData: CandlestickData<Time>[] = data.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      // Set data
      if (chartData.length > 0) {
        series.setData(chartData);

        // Auto-fit time scale
        chart.timeScale().fitContent();
      }

      chartRef.current = chart;
      seriesRef.current = series;
      setIsReady(true);
      onReady?.();

      // ✅ ResizeObserver for 100% responsive rendering
      const handleResize = () => {
        if (chartContainerRef.current) {
          const width = chartContainerRef.current.clientWidth;
          chart.applyOptions({ width });
        }
      };

      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(chartContainerRef.current);
    } catch (err) {
      console.error('Failed to initialize candlestick chart:', err);
      setError('Chart initialization failed');
    }

    // ✅ Cleanup function: CRITICAL for preventing memory leaks
    return () => {
      // Disconnect ResizeObserver
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      // Remove chart instance
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }

      setIsReady(false);
    };
  }, [onReady]);

  // ✅ Update data when prop changes
  useEffect(() => {
    if (!seriesRef.current || !isReady) return;

    try {
      const chartData: CandlestickData<Time>[] = data.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      if (chartData.length > 0) {
        seriesRef.current.setData(chartData);
        chartRef.current?.timeScale().fitContent();
      }
    } catch (err) {
      console.error('Failed to update chart data:', err);
    }
  }, [data, isReady]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card space-y-4 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{symbol}</h3>
          <p className="text-xs text-slate-400">Candlestick Chart - {data.length} periods</p>
        </div>

        {/* Status Indicator */}
        {isReady && (
          <div className="flex items-center gap-2 text-sm text-bull">
            <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
            <span>Live</span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      {error ? (
        <div className="p-8 flex items-center justify-center text-center text-bear">
          <p>{error}</p>
        </div>
      ) : (
        <div
          ref={chartContainerRef}
          style={{ height: `${height}px`, position: 'relative' }}
          className="relative"
        />
      )}

      {/* Footer Info */}
      <div className="px-4 pb-4 text-xs text-slate-500 flex items-center justify-between">
        <span>Interactive Chart • Scroll to zoom • Drag to pan</span>
        <span className="text-trust">lightweight-charts v4</span>
      </div>
    </motion.div>
  );
}
