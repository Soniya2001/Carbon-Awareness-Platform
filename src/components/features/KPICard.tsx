'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'eco' | 'sky' | 'amber' | 'red';
  className?: string;
  delay?: number;
}

const VARIANTS = {
  default: 'bg-card border-border',
  eco: 'bg-eco-50 border-eco-200 dark:bg-eco-900/20 dark:border-eco-800',
  sky: 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800',
  amber: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
};

const TREND_COLORS = {
  up: 'text-eco-600 dark:text-eco-400',
  down: 'text-red-500',
  neutral: 'text-muted-foreground',
};

export function KPICard({
  icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  variant = 'default',
  className,
  delay = 0,
}: KPICardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow duration-200',
        VARIANTS[variant],
        className,
      )}
      aria-label={`${title}: ${value}${subtitle ? `. ${subtitle}` : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-display text-foreground tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center shadow-sm">
            {icon}
          </div>
        </div>
      </div>

      {trend && trendValue && (
        <div className={cn('mt-3 flex items-center gap-1 text-xs font-medium', TREND_COLORS[trend])}>
          <TrendIcon className="w-3.5 h-3.5" aria-hidden />
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}
