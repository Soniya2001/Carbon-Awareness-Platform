'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Zap, Calendar, Heart, ShieldAlert, CheckCircle2, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { BADGE_DEFS, LEVEL_LABELS, LEVEL_THRESHOLDS } from '@/lib/storage';
import { formatDateShort } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { gamification, records } = useAppStore();

  const points = gamification?.points ?? 0;
  const level = gamification?.level ?? 1;
  const activeBadges = gamification?.badges ?? [];
  const streak = gamification?.streak ?? 0;

  // Last 14 days logging consistency leaf grid
  const streakCalendar = useMemo(() => {
    const dates = [];
    const recordDates = new Set(records.map((r) => r.date));
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const isLogged = recordDates.has(iso);
      dates.push({
        dateStr: iso,
        label: formatDateShort(iso),
        isLogged,
      });
    }
    return dates;
  }, [records]);

  const stats = [
    { title: 'Total Eco Points', value: points.toLocaleString(), icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Current Level', value: LEVEL_LABELS[level] || 'Seedling', icon: Award, color: 'text-eco-600 bg-eco-50 dark:bg-eco-900/20' },
    { title: 'Active Streak', value: `${streak} day${streak !== 1 ? 's' : ''}`, icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    { title: 'Badges Earned', value: `${activeBadges.length} / ${BADGE_DEFS.length}`, icon: CheckCircle2, color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" /> Achievements & Rewards
        </h2>
        <p className="text-muted-foreground text-sm">
          Track your rewards, consistency stats, and complete achievements to establish yourself as a Climate Hero.
        </p>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, i) => {
          const IconComp = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", item.color)}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">{item.title}</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Level Benchmarks & Logging Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak leaf grid */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" /> 14-Day Consistency Leaves
            </CardTitle>
            <CardDescription className="text-xs">
              Every leaf turns green when you log activities on that calendar day.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-7 gap-2.5 max-w-xs mx-auto">
              {streakCalendar.map((item) => (
                <div
                  key={item.dateStr}
                  className="flex flex-col items-center justify-center gap-1"
                  title={item.dateStr}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl border flex items-center justify-center text-lg shadow-sm transition-all duration-200',
                      item.isLogged
                        ? 'bg-eco-100 border-eco-300 text-eco-600 dark:bg-eco-900/40 dark:border-eco-800'
                        : 'bg-muted border-border text-muted-foreground/30'
                    )}
                    role="img"
                    aria-label={`${item.label}: ${item.isLogged ? 'Activity Logged' : 'No activity logged'}`}
                  >
                    🌱
                  </div>
                  <span className="text-[8px] font-semibold text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Level thresholds */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Sustainability Rank Benchmarks</CardTitle>
            <CardDescription className="text-xs">
              Levels and Eco Point thresholds to advance your sustainability ranking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {LEVEL_LABELS.slice(1).map((lvl, index) => {
              const actualLvl = index + 1;
              const threshold = LEVEL_THRESHOLDS[actualLvl];
              const isCurrent = level === actualLvl;
              const isLocked = points < threshold;

              return (
                <div
                  key={lvl}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border text-sm',
                    isCurrent
                      ? 'border-eco-300 bg-eco-50/50 dark:bg-eco-900/10'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden>{lvl.split(' ').slice(-1)[0]}</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {lvl.split(' ').slice(0, -1).join(' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">Level {actualLvl}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground">
                      {threshold.toLocaleString()} pts
                    </span>
                    {isCurrent && (
                      <Badge variant="eco" className="ml-2 text-[10px] uppercase font-bold shrink-0">
                        Current Rank
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display tracking-tight flex items-center gap-1.5">
          <Award className="w-5 h-5 text-sky-500" /> Badges Gallery
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BADGE_DEFS.map((badge, i) => {
            const isUnlocked = activeBadges.includes(badge.id);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'rounded-xl border p-4 flex items-start gap-4 transition-all duration-200',
                  isUnlocked
                    ? 'bg-card border-border hover:shadow-md'
                    : 'bg-muted/10 border-dashed border-border opacity-60'
                )}
                aria-label={`Badge: ${badge.name}. Status: ${isUnlocked ? 'Unlocked' : 'Locked'}`}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-sm shrink-0 border',
                    isUnlocked
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900'
                      : 'bg-muted border-border text-muted-foreground'
                  )}
                  role="img"
                  aria-hidden
                >
                  {isUnlocked ? badge.icon : '🔒'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">{badge.name}</h4>
                    {isUnlocked && (
                      <Badge variant="eco" className="text-[8px] font-bold uppercase py-0 px-1 shrink-0">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {badge.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider pt-1">
                    Req: {badge.requirement}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
