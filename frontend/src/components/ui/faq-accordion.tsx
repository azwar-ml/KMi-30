'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  reference?: {
    label: string;
    url: string;
  };
}

interface FAQAccordionProps {
  items?: FAQItem[];
  title?: string;
  defaultOpen?: string;
}

/**
 * FAQ Accordion Component
 * - Smooth open/close animations
 * - Reference links for credibility
 * - Customizable items and styling
 */
export function FAQAccordion({
  items = DEFAULT_FAQ_ITEMS,
  title = 'People Also Ask',
  defaultOpen,
}: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen || null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-xl font-semibold text-slate-100 mb-6">{title}</h3>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-lg border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
          >
            {/* Question Header */}
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-start justify-between gap-4 hover:bg-white/5 transition-colors text-left group"
            >
              <span className="font-semibold text-slate-100 group-hover:text-slate-50 transition-colors">
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: openId === item.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 mt-1"
              >
                <ChevronDown
                  size={20}
                  className="text-trust group-hover:text-emerald-300 transition-colors"
                />
              </motion.div>
            </button>

            {/* Answer Content */}
            <AnimatePresence mode="wait">
              {openId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 border-t border-white/5 bg-white/2">
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {item.answer}
                    </p>

                    {/* Reference Link */}
                    {item.reference && (
                      <motion.a
                        href={item.reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ x: 4 }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-trust hover:text-emerald-300 transition-colors"
                      >
                        {item.reference.label}
                        <ExternalLink size={14} />
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Default FAQ items for KMI-30
const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'what-is-kmi30',
    question: '📊 What is the KMI-30 Index?',
    answer:
      'The KMI-30 is a curated Shariah-compliant index of the 30 most liquid stocks on the Pakistan Stock Exchange (PSX). It represents the Islamic financial principles while providing exposure to Pakistan\'s leading blue-chip companies across diverse sectors.',
    reference: {
      label: 'Learn more about KMI-30',
      url: 'https://en.wikipedia.org/wiki/KMI-30',
    },
  },
  {
    id: 'shariah-compliance',
    question: '✓ What does Shariah compliance mean?',
    answer:
      'Shariah compliance ensures that investments adhere to Islamic financial principles. This includes avoiding companies in prohibited sectors (alcohol, gambling, conventional banking), maintaining healthy financial ratios, and ensuring profit comes from halal business activities. Our system uses multiple screening criteria to verify compliance.',
    reference: {
      label: 'Shariah Screening Criteria (AAOIFI Standards)',
      url: 'https://aaoifi.com/',
    },
  },
  {
    id: 'dcf-valuation',
    question: '💰 How is Intrinsic Value calculated using DCF?',
    answer:
      'Discounted Cash Flow (DCF) analysis projects a company\'s future cash flows and discounts them to present value using the Weighted Average Cost of Capital (WACC). This method provides an intrinsic value estimate independent of market sentiment. Our DCF model includes free cash flow forecasts, terminal value calculations, and margin of safety margins.',
    reference: {
      label: 'DCF Analysis Guide',
      url: 'https://www.investopedia.com/terms/d/dcf.asp',
    },
  },
  {
    id: 'ai-memo',
    question: '🤖 How are AI Committee Recommendations generated?',
    answer:
      'Our AI Committee uses machine learning models trained on historical PSX data, Shariah compliance metrics, fundamental analysis, and macroeconomic indicators to generate investment recommendations. Each recommendation includes a confidence score and supporting rationale based on multiple data sources.',
    reference: {
      label: 'Understand AI in Finance',
      url: 'https://www.mckinsey.com/industries/financial-services/our-insights/ai-in-finance',
    },
  },
  {
    id: 'price-change',
    question: '📈 What does the percentage change represent?',
    answer:
      'The percentage change (%) shows the daily price movement of a stock compared to the previous trading day\'s closing price. Green indicates price gains, while red indicates losses. This metric helps investors quickly assess daily volatility and market sentiment.',
    reference: {
      label: 'Stock Price Change Explained',
      url: 'https://www.investopedia.com/terms/p/price-appreciation.asp',
    },
  },
  {
    id: 'market-data-freshness',
    question: '🔄 How fresh is the market data?',
    answer:
      'Our system syncs live prices every 60 seconds from the PSX API bridge, with historical data updated daily. The data freshness indicator in the top ticker shows when the last update occurred. All timestamps are in Pakistan Standard Time (PST).',
    reference: {
      label: 'PSX Market Hours',
      url: 'https://www.psx.com.pk/pages/timing-information',
    },
  },
  {
    id: 'sector-analysis',
    question: '🏭 How are sectors classified?',
    answer:
      'Stocks are classified into sectors based on their primary business activities: Banking, Oil & Gas, Cement, Telecommunications, Automobiles, and more. Sector analysis helps identify diversification opportunities and understand market exposure across different industries.',
    reference: {
      label: 'PSX Sector Classification',
      url: 'https://www.psx.com.pk/',
    },
  },
  {
    id: 'ratings-explained',
    question: '⭐ What do the Shariah Compliance ratings mean?',
    answer:
      'Ratings range from 1-100 and indicate the degree of Shariah compliance. A score above 80 indicates strong compliance with Islamic finance principles. Our rating system considers debt ratios, non-halal income percentages, asset composition, and other AAOIFI-aligned criteria.',
    reference: {
      label: 'AAOIFI Shariah Standards',
      url: 'https://aaoifi.com/standards/',
    },
  },
];
