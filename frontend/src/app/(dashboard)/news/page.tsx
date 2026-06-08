'use client';

import { motion } from 'framer-motion';
import { useMarketNews, useMacroIndicators } from '@/hooks/useApi';
import { ExternalLink, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

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

function NewsSection() {
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
        return 'bg-bull/5 border-bull/20 hover:bg-bull/10';
      case 'negative':
        return 'bg-bear/5 border-bear/20 hover:bg-bear/10';
      default:
        return 'bg-caution/5 border-caution/20 hover:bg-caution/10';
    }
  };

  if (isLoading && !news) {
    return (
      <div className="glass rounded-xl p-12 border border-white/5 flex flex-col items-center justify-center">
        <Loader2 size={32} className="text-trust animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Loading market news...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">📰 Market News & Analysis</h2>
          <p className="text-slate-400 text-sm mt-1">Latest PSX and financial market news</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-caution/10 border border-caution/20 rounded-lg">
            <AlertCircle size={16} className="text-caution" />
            <span className="text-xs text-caution">Using cached data</span>
          </div>
        )}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!news || news.length === 0 ? (
          <div className="col-span-full flex items-center justify-center h-64 text-slate-400">
            <p>No news available at this time</p>
          </div>
        ) : (
          news.map((article: any, idx: number) => (
            <motion.a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                group glass rounded-xl p-5 border transition-all
                ${getSentimentColor(article.sentiment)}
                hover:shadow-lg hover:scale-105
              `}
            >
              {/* Top Bar */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(article.sentiment)}
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    {article.source}
                  </span>
                </div>
                <div className="px-2 py-1 bg-white/10 rounded text-xs font-bold text-slate-200">
                  {article.relevance}%
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-100 mb-2 group-hover:text-slate-50 transition-colors line-clamp-2">
                {article.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-4 line-clamp-3">
                {article.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-slate-500">
                  {formatTimeAgo(article.publishedAt)}
                </span>
                <ExternalLink
                  size={14}
                  className="text-trust opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </motion.a>
          ))
        )}
      </div>
    </div>
  );
}

function MacroIndicatorsSection() {
  const { data: indicators } = useMacroIndicators();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-100">📊 Pakistan Macro Indicators</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators?.map((indicator: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-slate-200">{indicator.indicator}</p>
              {indicator.trend === 'up' ? (
                <TrendingUp size={16} className="text-bull" />
              ) : indicator.trend === 'down' ? (
                <TrendingDown size={16} className="text-bear" />
              ) : (
                <AlertCircle size={16} className="text-caution" />
              )}
            </div>
            <p className="text-2xl font-bold text-slate-100 mb-1">
              {indicator.value}
              <span className="text-sm font-semibold text-slate-400 ml-2">{indicator.unit}</span>
            </p>
            <p className="text-xs text-slate-500">Last updated: {new Date(indicator.lastUpdated).toLocaleDateString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="p-8 bg-gradient-bloomberg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-12"
      >
        <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
          <NewsSection />
        </Suspense>

        <Suspense fallback={<div className="text-slate-400">Loading indicators...</div>}>
          <MacroIndicatorsSection />
        </Suspense>
      </motion.div>
    </div>
  );
}
