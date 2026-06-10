'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, TrendingDown, Zap, Star, ArrowRight,
  Activity, Bot, Target,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { FootprintLineChart } from '@/src/components/charts/FootprintLineChart';
import { CategoryPieChart } from '@/src/components/charts/CategoryPieChart';
import { useCarbon } from '@/src/hooks/useCarbon';
import { useGamification } from '@/src/hooks/useGamification';
import { formatCO2, formatRelativeTime } from '@/src/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export default function DashboardPage() {
  const { summary, history, fetchSummary, fetchHistory, isLoading } = useCarbon();
  const { points, fetchPoints } = useGamification();

  useEffect(() => {
    fetchSummary();
    fetchHistory({ limit: 7 });
    fetchPoints();
  }, [fetchSummary, fetchHistory, fetchPoints]);

  const todayCo2 = summary?.byCategory
    ? Object.values(summary.byCategory).reduce((a, b) => a + b, 0)
    : 0;

  const sustainabilityScore = summary?.sustainabilityScore ?? 0;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your sustainability overview for today
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Today's footprint */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today&apos;s Footprint
              </CardTitle>
              <Leaf className="h-4 w-4 text-eco-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCO2(todayCo2)}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary?.trend === 'improving' ? (
                  <span className="text-eco-600">↓ Improving</span>
                ) : summary?.trend === 'worsening' ? (
                  <span className="text-red-600">↑ Worsening</span>
                ) : (
                  <span className="text-yellow-600">→ Stable</span>
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly total */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weekly Total
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalCo2e ? formatCO2(summary.totalCo2e / 52) : '—'}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary?.comparedToGlobal !== undefined
                  ? `${summary.comparedToGlobal > 0 ? '+' : ''}${summary.comparedToGlobal.toFixed(0)}% vs global avg`
                  : 'No data yet'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Eco Points */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eco Points
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{points?.total ?? 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Level: {points?.level ?? 'Green Beginner'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sustainability Score */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sustainability Score
              </CardTitle>
              <Star className="h-4 w-4 text-orange-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sustainabilityScore}/100</div>
              <Progress
                value={sustainabilityScore}
                className="mt-2 h-1.5"
                aria-label={`Sustainability score: ${sustainabilityScore} out of 100`}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line chart - trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">7-Day Emissions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <FootprintLineChart
              data={history?.slice(0, 7).map((r) => ({
                date: r.date,
                value: r.total,
              })) ?? []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Pie chart - by category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart
              data={summary?.byCategory ?? {}}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* AI Coach teaser */}
        <Card className="border-eco-200 bg-eco-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-eco-100 p-2">
                <Bot className="h-5 w-5 text-eco-700" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-eco-900 text-sm">Ask your AI Coach</h3>
                <p className="mt-1 text-xs text-eco-700 leading-relaxed">
                  Get personalised tips to reduce your footprint today.
                </p>
                <Button variant="eco" size="sm" className="mt-3" asChild>
                  <Link href="/ai-coach">
                    Chat now <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log activity */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Activity className="h-5 w-5 text-blue-700" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">Log today&apos;s activities</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Track transport, energy, food, and more.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/tracker">
                    Open tracker <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active challenge */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Target className="h-5 w-5 text-purple-700" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">Active Challenges</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Complete missions and earn eco points.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/challenges">
                    View challenges <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activities */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tracker">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" role="list" aria-label="Recent carbon activities">
              {history.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                  role="listitem"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Transport · Energy · Food
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCO2(record.total)}</p>
                    <Badge
                      variant="outline"
                      className={record.total < 10 ? 'text-eco-600 border-eco-300' : 'text-orange-600 border-orange-300'}
                    >
                      {record.total < 10 ? 'Low' : record.total < 20 ? 'Medium' : 'High'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {(!history || history.length === 0) && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Leaf className="mx-auto h-10 w-10 text-eco-300" aria-hidden="true" />
            <h3 className="mt-4 font-semibold text-gray-900">No activities logged yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking your carbon footprint to see insights here.
            </p>
            <Button variant="eco" className="mt-4" asChild>
              <Link href="/tracker">Log your first activity</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
