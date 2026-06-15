'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Leaf,
  Activity,
  Zap,
  Flame,
  Award,
  ArrowUpRight,
  Plus,
  Compass,
  Trophy,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { KPICard } from '@/components/features/KPICard';
import { ChallengeCard } from '@/components/features/ChallengeCard';
import { PieBreakdown, TrendLine } from '@/components/charts';
import { useAppStore } from '@/store/useAppStore';
import { carbonScore, sustainabilityScore, CATEGORY_ICONS } from '@/lib/carbonEngine';
import { pointsToNextLevel, LEVEL_LABELS, BADGE_DEFS } from '@/lib/storage';
import { formatCO2, formatDateShort, capitalize } from '@/lib/utils';

export default function DashboardPage() {
  const {
    records,
    monthlySummary,
    gamification,
    challenges,
    simulations,
    preferences,
    joinChallenge,
    markChallengeComplete,
    updateChallengeProgress,
  } = useAppStore();

  const totalMonthlyKg = monthlySummary?.total ?? 0;
  const scoreData = useMemo(() => carbonScore(totalMonthlyKg), [totalMonthlyKg]);
  const sustScore = useMemo(() => sustainabilityScore(totalMonthlyKg * 12), [totalMonthlyKg]);

  const points = gamification?.points ?? 0;
  const levelLabel = gamification ? LEVEL_LABELS[gamification.level] ?? 'Seedling 🌱' : 'Seedling 🌱';
  const levelProgress = useMemo(() => pointsToNextLevel(points), [points]);
  const activeChallenges = useMemo(() => challenges.filter((c) => c.joined && !c.completed).slice(0, 3), [challenges]);
  const recentActivities = useMemo(() => [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [records]);

  // Construct charts data
  const pieData = useMemo(() => {
    if (!monthlySummary?.byCategory) return [];
    return Object.entries(monthlySummary.byCategory).map(([category, value]) => ({
      name: capitalize(category),
      value,
      category,
    }));
  }, [monthlySummary]);

  const trendData = useMemo(() => {
    if (!monthlySummary?.dailyRecords) return [];
    return monthlySummary.dailyRecords.map((r) => ({
      date: r.date,
      total: r.total,
    }));
  }, [monthlySummary]);

  // Streak status
  const streak = gamification?.streak ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight">
            Hi, {preferences?.name || 'Eco Warrior'}! 👋
          </h2>
          <p className="text-muted-foreground text-sm">
            Here is your carbon breakdown and eco coaching overview for this month.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="gradient">
            <Link href="/calculator">
              <Plus className="w-4 h-4 mr-1.5" /> Log Activity
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Carbon Grade"
          value={scoreData.grade}
          subtitle={scoreData.label}
          icon={<Zap className="w-5 h-5 text-sky-500" />}
          variant={scoreData.grade === 'A+' || scoreData.grade === 'A' ? 'eco' : 'amber'}
          trend={scoreData.vsGlobal <= 0 ? 'up' : 'down'}
          trendValue={
            scoreData.vsGlobal <= 0
              ? `${Math.abs(scoreData.vsGlobal)}% below avg`
              : `${scoreData.vsGlobal}% above avg`
          }
        />
        <KPICard
          title="Sustainability Score"
          value={`${sustScore}/100`}
          subtitle="Annual rating index"
          icon={<Leaf className="w-5 h-5 text-eco-600" />}
          variant="eco"
          trend={sustScore >= 60 ? 'up' : 'neutral'}
          trendValue={sustScore >= 80 ? 'Excellent' : sustScore >= 60 ? 'Good' : 'Needs attention'}
        />
        <KPICard
          title="Eco Points & Level"
          value={points.toLocaleString()}
          subtitle={levelLabel}
          icon={<Award className="w-5 h-5 text-amber-500" />}
          variant="amber"
        />
        <KPICard
          title="Daily Streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
          subtitle="Consistency reward active"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          variant={streak > 0 ? 'sky' : 'default'}
          trend={streak > 0 ? 'up' : 'neutral'}
          trendValue={streak > 0 ? 'Keep it up!' : 'Log today to start'}
        />
      </div>

      {/* Level Progress Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Level Progress</span>
              <span>
                {points.toLocaleString()} / {levelProgress.nextThreshold.toLocaleString()} pts
              </span>
            </div>
            <Progress
              value={(levelProgress.current / levelProgress.needed) * 100}
              className="h-2"
              aria-label={`Progress to next level: ${Math.round((levelProgress.current / levelProgress.needed) * 100)}%`}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center sm:text-right shrink-0">
            Earn <span className="font-bold text-foreground">{(levelProgress.needed - levelProgress.current).toLocaleString()} pts</span> to reach the next level!
          </p>
        </CardContent>
      </Card>

      {/* Main Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Emission Sources</CardTitle>
            <CardDescription>Monthly category footprint distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <PieBreakdown data={pieData} />
          </CardContent>
        </Card>

        {/* Bar breakdown / Daily Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daily Emissions Trend</CardTitle>
              <CardDescription>Visual tracker of carbon usage (kg CO₂e)</CardDescription>
            </div>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              This Month: {formatCO2(totalMonthlyKg)}
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            {records.length > 0 ? (
              <TrendLine data={trendData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] text-center p-6 text-muted-foreground">
                <Activity className="w-10 h-10 text-muted-foreground/40 mb-2" />
                <p className="font-medium text-sm">No activity recorded</p>
                <p className="text-xs mt-1">
                  Once you start logging daily habits, you will see a detailed carbon trend here.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link href="/calculator">Log First Activity</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid: Challenges, Recent Logs & Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Challenges */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-display tracking-tight flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500" /> Active Challenges
            </h3>
            <Button asChild size="sm" variant="ghost">
              <Link href="/challenges">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </Button>
          </div>
          {activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={joinChallenge}
                  onComplete={markChallengeComplete}
                  onUpdateProgress={updateChallengeProgress}
                />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Compass className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm">No active challenges</p>
              <p className="text-xs mt-1">
                Join challenges to complete daily missions and earn extra eco points!
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/challenges">Explore Challenges</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Recent Activities & Twin */}
        <div className="space-y-6 lg:col-span-1">
          {/* Recent Logs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display tracking-tight flex items-center gap-1.5">
              <Activity className="w-5 h-5 text-eco-600" /> Recent Activities
            </h3>
            <Card>
              <CardContent className="p-0">
                {recentActivities.length > 0 ? (
                  <div className="divide-y divide-border">
                    {recentActivities.map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-3 text-sm hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" aria-hidden>
                            {CATEGORY_ICONS[log.category] ?? '🌱'}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground capitalize">
                              {log.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateShort(log.date)} · {log.value} {log.unit}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-red-500 shrink-0 text-xs">
                          +{formatCO2(log.co2e)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p className="text-xs font-semibold">No recent logs</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Saved Twin Simulations */}
          {simulations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display tracking-tight flex items-center gap-1.5">
                <GitBranch className="w-5 h-5 text-sky-500" /> Saved Simulations
              </h3>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {simulations.slice(0, 2).map((sim) => (
                      <div key={sim.id} className="p-3 text-sm hover:bg-muted/40 transition-colors">
                        <div className="flex justify-between">
                          <p className="font-semibold text-foreground text-xs">
                            {sim.scenarioName}
                          </p>
                          <span className="text-[10px] bg-eco-100 text-eco-700 dark:bg-eco-900/30 dark:text-eco-400 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                            {sim.savingPercent}% saving
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Saves {formatCO2(sim.annualSavingKg)}/year over {sim.years} years.
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
