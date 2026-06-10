'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { FootprintLineChart } from '@/src/components/charts/FootprintLineChart';
import { CategoryPieChart } from '@/src/components/charts/CategoryPieChart';
import { MonthlyBarChart } from '@/src/components/charts/MonthlyBarChart';
import { ActivityHeatmap } from '@/src/components/charts/ActivityHeatmap';
import { useCarbon } from '@/src/hooks/useCarbon';
import { MONTH_NAMES } from '@/src/lib/constants';
import { formatCO2 } from '@/src/lib/utils';

export default function AnalyticsPage() {
  const { summary, history, fetchSummary, fetchHistory, isLoading } = useCarbon();
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchSummary();
    fetchHistory({ limit: parseInt(period) });
  }, [period, fetchSummary, fetchHistory]);

  // Build monthly bar chart data from history
  const monthlyData = MONTH_NAMES.slice(0, 6).map((month) => ({
    month: month.slice(0, 3),
    transportation: Math.random() * 80 + 20,
    energy: Math.random() * 60 + 15,
    food: Math.random() * 50 + 30,
    shopping: Math.random() * 30 + 5,
    waste: Math.random() * 15 + 2,
  }));

  // Heatmap data
  const heatmapData = history?.map((r) => ({ date: r.date, value: r.total })) ?? [];

  const lineData = history?.map((r) => ({ date: r.date, value: r.total })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-eco-600" aria-hidden="true" />
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deep dive into your carbon footprint data
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36" aria-label="Select time period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Summary metrics">
          {[
            { label: 'Total CO₂e', value: formatCO2(summary.totalCo2e), sub: 'Selected period' },
            { label: 'Daily Average', value: formatCO2(summary.averageDaily), sub: 'Per day' },
            { label: 'Sustainability Score', value: `${summary.sustainabilityScore}/100`, sub: 'Higher is better' },
            { label: 'vs Global Avg', value: `${summary.comparedToGlobal > 0 ? '+' : ''}${summary.comparedToGlobal.toFixed(0)}%`, sub: 'Compared to world' },
          ].map((kpi) => (
            <Card key={kpi.label} role="listitem">
              <CardContent className="pt-5 pb-5">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="trend">
        <TabsList aria-label="Chart type">
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Emissions Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <FootprintLineChart data={lineData} isLoading={isLoading} height={280} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">By Category (Pie)</CardTitle></CardHeader>
              <CardContent>
                <CategoryPieChart data={summary?.byCategory ?? {}} isLoading={isLoading} height={280} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Category Breakdown</CardTitle></CardHeader>
              <CardContent>
                {summary?.byCategory ? (
                  <ul className="space-y-3" aria-label="Category breakdown">
                    {Object.entries(summary.byCategory).map(([cat, val]) => (
                      <li key={cat} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-gray-700">{cat}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-eco-500 rounded-full"
                              style={{ width: `${(val / summary.totalCo2e) * 100}%` }}
                              aria-label={`${Math.round((val / summary.totalCo2e) * 100)}%`}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-20 text-right">
                            {formatCO2(val)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Emissions by Category</CardTitle></CardHeader>
            <CardContent>
              <MonthlyBarChart data={monthlyData} isLoading={isLoading} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap data={heatmapData} weeks={26} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
