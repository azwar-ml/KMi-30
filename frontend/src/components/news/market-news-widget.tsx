'use client';

import { motion } from 'framer-motion';
import { useMarketNews } from '@/hooks/useApi';
import { ExternalLink, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Helper: Format time difference
 */
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

/**
 * Market News Widget
 * - Display latest PSX/market news
 * - Sentiment indicators (positive/negative/neutral)
 * - Reference links with external icon
 * - Graceful fallback to mock data on API errors
 */
export function MarketNewsWidget() {
  const { data: news, isLoading, error } = useMarketNews();

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp size={16} className="text-bull" />;
      case 'negative':
        return <TrendingDown size={16} className="text-bear" />;
      default:
        return <AlertCircle size={16} className="text-caution" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-bull/10 border-bull/20 hover:bg-bull/15';
      case 'negative':
        return 'bg-bear/10 border-bear/20 hover:bg-bear/15';
      default:
        return 'bg-caution/10 border-caution/20 hover:bg-caution/15';
    }
  };

  if (isLoading && !news) {
    return (
      <div className="glass rounded-xl p-6 border border-white/5 h-full flex flex-col items-center justify-center">
        <Loader2 size={32} className="text-trust animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Loading market news...</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-white/5 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">📰 Market News</h3>
          {error && (
            <span className="text-xs text-caution flex items-center gap-1">
              <AlertCircle size={14} />
              Using cached data
            </span>
          )}
        </div>
      </div>

      {/* News Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {!news || news.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No news available
          </div>
        ) : (
          news.map((article: any, idx: number) => (
            <motion.a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                group block p-3 rounded-lg border transition-all
                ${getSentimentColor(article.sentiment)}
                cursor-pointer
              `}
            >
              {/* Sentiment Badge + Relevance */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(article.sentiment)}
                  <span className="text-xs font-semibold text-slate-300 opacity-75">
                    {article.source}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  {article.relevance}%
                </div>
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-slate-100 mb-1 group-hover:text-slate-50 transition-colors line-clamp-2">
                {article.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-2 line-clamp-2 group-hover:text-slate-300 transition-colors">
                {article.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {formatTimeAgo(article.publishedAt)}
                </span>
                <ExternalLink size={12} className="text-trust opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))
        )}
      </div>
    </div>
  );
}
