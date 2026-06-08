'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  fallbackHeight?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * WidgetErrorBoundary - Catches errors in individual dashboard widgets
 * Keeps the rest of the terminal functional
 * Shows "Data Feed Interrupted" with retry button
 */
export class WidgetErrorBoundary extends React.Component<
  WidgetErrorBoundaryProps,
  State
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget error caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`glass-card p-6 flex flex-col items-center justify-center gap-4 ${
            this.props.fallbackHeight || 'h-64'
          }`}
        >
          {/* Error Icon */}
          <div className="p-3 rounded-full bg-bear/20 border border-bear/30">
            <AlertCircle size={24} className="text-bear" />
          </div>

          {/* Error Message */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-slate-200">
              {this.props.title || 'Data Feed'} Interrupted
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {this.state.error?.message || 'Unable to load this widget'}
            </p>
          </div>

          {/* Retry Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bear/20 hover:bg-bear/30 text-bear text-sm font-semibold transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </motion.button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for easier usage with hooks
 */
export function withWidgetErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  title?: string,
  fallbackHeight?: string,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <WidgetErrorBoundary title={title} fallbackHeight={fallbackHeight}>
        <Component {...props} />
      </WidgetErrorBoundary>
    );
  };
}
