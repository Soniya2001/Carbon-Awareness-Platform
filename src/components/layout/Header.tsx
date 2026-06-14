'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Moon, Sun, Bell, Settings, Flame } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calculator': 'Carbon Calculator',
  '/carbon-twin': 'Carbon Twin',
  '/forecast': 'Forecast',
  '/challenges': 'Challenges',
  '/community': 'Community Impact',
  '/ai-coach': 'AI Coach',
  '/achievements': 'Achievements',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { newBadges, gamification } = useAppStore();

  const title = PAGE_TITLES[pathname] ?? 'CarbonWise AI';
  const streak = gamification?.streak ?? 0;
  const hasNewBadges = newBadges.length > 0;

  return (
    <header
      className="flex items-center justify-between h-16 px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40"
      role="banner"
    >
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold font-display text-foreground">{title}</h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Streak display */}
        {streak > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
            title={`${streak} day streak`}
            aria-label={`${streak} day logging streak`}
          >
            <Flame className="w-4 h-4" aria-hidden />
            <span className="text-sm font-semibold">{streak}</span>
          </div>
        )}

        {/* Badge notifications */}
        <AnimatePresence>
          {hasNewBadges && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label={`${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''} earned`}
                onClick={() => router.push('/achievements')}
                className="relative"
              >
                <Bell className="w-5 h-5" aria-hidden />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-eco-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {newBadges.length}
                </span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <Sun
            className={cn('h-5 w-5 transition-all', theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0')}
            aria-hidden
          />
          <Moon
            className={cn(
              'absolute h-5 w-5 transition-all',
              theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100',
            )}
            aria-hidden
          />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Settings shortcut */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/settings')}
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" aria-hidden />
        </Button>
      </div>
    </header>
  );
}
