'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  HelpCircle,
} from 'lucide-react';

/**
 * Collapsible sidebar with icon-only mode
 * - Toggle between full width (with labels) and icon-only (collapsed)
 * - Responsive: Mobile always collapses, desktop has toggle
 * - Main content expands when sidebar collapses
 */
export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/', color: 'text-trust' },
    { icon: BarChart3, label: 'Markets', href: '/markets', color: 'text-trust' },
    { icon: Newspaper, label: 'News', href: '/news', color: 'text-bull' },
    { icon: Brain, label: 'AI Committee', href: '/ai-committee', color: 'text-bull' },
    { icon: Shield, label: 'Shariah', href: '/shariah', color: 'text-caution' },
    { icon: Activity, label: 'Health', href: '/health', color: 'text-trust' },
  ];

  const helpItems = [
    { icon: HelpCircle, label: 'Help & FAQ', href: '/faq', color: 'text-emerald-400' },
  ];

  const adminItems = [
    { icon: Settings, label: 'Admin', href: '/admin', color: 'text-slate-400' },
  ];

  return (
    <>
      {/* Mobile Toggle Button - Visible on mobile only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden glass-sm p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -240 }}
        animate={{ x: isOpen ? 0 : -240 }}
        transition={{ duration: 0.3 }}
        className={`
          fixed md:static
          h-screen z-40
          glass rounded-r-2xl
          border-r border-white/5
          overflow-y-auto
          transition-all duration-300
          flex flex-col
          ${isOpen ? 'md:translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-60'}
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b border-white/5 flex items-center justify-between ${isCollapsed ? 'flex-col' : ''}`}>
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-trust via-bull to-caution bg-clip-text text-transparent">
              KMI-30
            </h1>
            <p className="text-xs text-slate-400 mt-1">Alpha v4.0</p>
          </div>

          {/* Logo Icon when collapsed */}
          {isCollapsed && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-trust to-bull flex items-center justify-center text-white font-bold">
              K
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex ml-auto text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800/50"
            aria-label="Toggle sidebar width"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    cursor-pointer group relative
                    ${isActive ? 'bg-slate-800/80 border-l-2 border-trust' : 'hover:bg-slate-800/50'}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon
                    size={20}
                    className={`${item.color} transition-colors group-hover:text-emerald-400 flex-shrink-0`}
                  />
                  <motion.span
                    initial={false}
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-slate-300 group-hover:text-slate-100 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 rounded-lg text-xs text-slate-200 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className={`px-2 py-4 border-t border-white/5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed && (
            <p className="text-xs uppercase text-slate-500 font-semibold px-2 mb-2">
              Help
            </p>
          )}
          {helpItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    cursor-pointer group relative
                    ${isActive ? 'bg-slate-800/80 border-l-2 border-emerald-400' : 'hover:bg-slate-800/50'}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon
                    size={20}
                    className={`${item.color} transition-colors group-hover:text-emerald-300 flex-shrink-0`}
                  />
                  <motion.span
                    initial={false}
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-slate-300 group-hover:text-slate-100 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 rounded-lg text-xs text-slate-200 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        <div className={`px-2 py-4 border-t border-white/5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed && (
            <p className="text-xs uppercase text-slate-500 font-semibold px-2 mb-2">
              Admin
            </p>
          )}
          {adminItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    hover:bg-slate-800/50 cursor-pointer group relative
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon
                    size={20}
                    className={`${item.color} transition-colors group-hover:text-emerald-400 flex-shrink-0`}
                  />
                  <motion.span
                    initial={false}
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-slate-300 group-hover:text-slate-100 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 rounded-lg text-xs text-slate-200 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
