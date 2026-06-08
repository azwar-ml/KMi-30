'use client';

import { motion } from 'framer-motion';
import { FAQAccordion } from '@/components/ui/faq-accordion';

/**
 * FAQ Help Center Page
 * - Accordion-style FAQ with reference links
 * - Covers all major topics: KMI-30, Shariah, DCF, AI, etc.
 * - Smooth animations and professional styling
 */
export default function FAQPage() {
  return (
    <div className="p-8 bg-gradient-bloomberg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-trust via-bull to-caution bg-clip-text text-transparent mb-3">
            Help & FAQ
          </h1>
          <p className="text-slate-400 text-lg">
            Find answers to common questions about KMI-30, market analysis, and Shariah compliance
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-8 border border-white/5"
        >
          <FAQAccordion />
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 glass rounded-xl p-8 border border-white/5 text-center"
        >
          <h3 className="text-xl font-semibold text-slate-100 mb-3">Didn't find what you're looking for?</h3>
          <p className="text-slate-400 mb-6">
            Visit our documentation or contact support for more information
          </p>
          <div className="flex items-center justify-center gap-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg bg-trust/10 border border-trust/20 text-trust hover:bg-trust/20 transition-all font-semibold"
            >
              View Documentation
            </motion.a>
            <motion.a
              href="mailto:support@kmi30.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg bg-bull/10 border border-bull/20 text-bull hover:bg-bull/20 transition-all font-semibold"
            >
              Contact Support
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
