/**
 * Format currency to PKR with 2 decimals
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format percentage change with color indicator
 */
export const formatPercentChange = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined) return '—';
  const formatted = `${(value * 100).toFixed(decimals)}%`;
  return value >= 0 ? `+${formatted}` : formatted;
};

/**
 * Format large numbers (millions, billions)
 */
export const formatCompactNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  
  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  
  return value.toFixed(2);
};

/**
 * Get color based on value (positive = green, negative = red)
 */
export const getValueColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'text-slate-400';
  if (value > 0) return 'text-bull';
  if (value < 0) return 'text-bear';
  return 'text-slate-400';
};

/**
 * Get background color based on value
 */
export const getValueBgColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'bg-slate-900/20';
  if (value > 0) return 'bg-bull/10';
  if (value < 0) return 'bg-bear/10';
  return 'bg-slate-900/20';
};

/**
 * Format timestamp to readable date/time
 */
export const formatTime = (date: Date | string, format: 'date' | 'time' | 'datetime' = 'datetime'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'date') {
    return d.toLocaleDateString('en-PK');
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  }
  
  return d.toLocaleString('en-PK');
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Map value from one range to another
 */
export const mapRange = (value: number, min: number, max: number, outMin: number, outMax: number): number => {
  return ((value - min) / (max - min)) * (outMax - outMin) + outMin;
};

/**
 * Get Shariah compliance status
 */
export const getShariaStatus = (
  debtRatio: number | null | undefined,
  threshold = 0.33,
): { isCompliant: boolean; message: string; color: string } => {
  if (debtRatio === null || debtRatio === undefined) {
    return { isCompliant: false, message: 'Insufficient data', color: 'text-slate-400' };
  }
  
  const isCompliant = debtRatio <= threshold;
  
  return {
    isCompliant,
    message: isCompliant ? '✓ Compliant' : '🔴 Non-Compliant',
    color: isCompliant ? 'text-bull' : 'text-bear',
  };
};

/**
 * Get rating color (0-5 stars)
 */
export const getRatingColor = (rating: number | null | undefined): string => {
  if (rating === null || rating === undefined) return 'text-slate-400';
  if (rating >= 4) return 'text-bull';
  if (rating >= 3) return 'text-trust';
  if (rating >= 2) return 'text-caution';
  return 'text-bear';
};
