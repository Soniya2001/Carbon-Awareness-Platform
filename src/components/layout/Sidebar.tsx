'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calculator, GitBranch, TrendingUp,
  Target, Users, Bot, Award, Settings, ChevronLeft,
  ChevronRight, Leaf, Flame, UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { LEVEL_LABELS } from '@/lib/storage';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/profile',      label: 'My Profile',   icon: UserCircle      },
  { href: '/calculator',   label: 'Calculator',   icon: Calculator      },
  { href: '/carbon-twin',  label: 'Carbon Twin',  icon: GitBranch       },
  { href: '/forecast',     label: 'Forecast',     icon: TrendingUp      },
  { href: '/challenges',   label: 'Challenges',   icon: Target          },
  { href: '/community',    label: 'Community',    icon: Users           },
  { href: '/ai-coach',     label: 'AI Coach',     icon: Bot             },
  { href: '/achievements', label: 'Achievements', icon: Award           },
  { href: '/settings',     label: 'Settings',     icon: Settings        },
];

export function Sidebar() {
  const pathname = usePathname();
  const { gamification } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cw_sidebar_collapsed');
      if (stored) setCollapsed(stored === 'true');
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('cw_sidebar_collapsed', String(next));
    } catch {}
  };

  const levelLabel = gamification ? LEVEL_LABELS[gamification.level] ?? 'Seedling 🌱' : 'Seedling 🌱';
  const points = gamification?.points ?? 0;
  const streak = gamification?.streak ?? 0;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-card border-r border-border overflow-hidden shrink-0"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border min-h-[64px]">
        <div className="flex-shrink-0 w-8 h-8 bg-eco-gradient rounded-lg flex items-center justify-center shadow-eco">
          <Leaf className="w-4 h-4 text-white" aria-hidden />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-display font-bold text-foreground text-sm whitespace-nowrap"
            >
              CarbonWise AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="App navigation">
        <ul role="list" className="space-y-1 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-eco-100 text-eco-700 dark:bg-eco-900/30 dark:text-eco-400'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0',
                      isActive ? 'text-eco-600 dark:text-eco-400' : 'text-muted-foreground',
                    )}
                    aria-hidden
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Eco Points & Level */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border-t border-border"
          >
            <div className="rounded-lg bg-eco-50 dark:bg-eco-900/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-eco-700 dark:text-eco-400">
                  {levelLabel}
                </span>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-amber-500" title={`${streak} day streak`}>
                    <Flame className="w-3.5 h-3.5" aria-hidden />
                    <span className="text-xs font-bold">{streak}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-eco-600" aria-hidden />
                <span className="text-xs font-semibold text-eco-700 dark:text-eco-400">
                  {points.toLocaleString()} pts
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" aria-hidden />
        ) : (
          <ChevronLeft className="w-3 h-3" aria-hidden />
        )}
      </button>
    </motion.aside>
  );
}
