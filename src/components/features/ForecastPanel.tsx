'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ForecastArea } from '@/components/charts';
import { useAppStore } from '@/store/useAppStore';
import { forecastFromHistory, type ForecastResult } from '@/lib/simulationEngine';
import { generateForecastInsight } from '@/lib/gemini';
import { formatCO2 } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TREND_BADGE = {
  increasing: {
    label: 'Increasing',
    variant: 'red' as const,
    icon: TrendingUp,
    color: 'text-red-500',
  },
  stable: {
    label: 'Stable',
    variant: 'amber' as const,
    icon: Minus,
    color: 'text-amber-500',
  },
  decreasing: {
    label: 'Decreasing',
    variant: 'eco' as const,
    icon: TrendingDown,
    color: 'text-eco-600',
  },
};

export function ForecastPanel() {
  const { records, monthlySummary, preferences, setAILoading } = useAppStore();
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    // Build daily records from stored records
    const dailyMap: Record<string, number> = {};
    for (const r of records) {
      dailyMap[r.date] = (dailyMap[r.date] ?? 0) + r.co2e;
    }
    const dailyRecords = Object.entries(dailyMap).map(([date, total]) => ({ date, total }));
    const result = forecastFromHistory(dailyRecords);
    setForecast(result);
  }, [records]);

  useEffect(() => {
    if (!forecast) return;
    const apiKey = preferences?.geminiApiKey ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
    if (!apiKey) return;

    setLoadingInsight(true);
    setAILoading(true);

    generateForecastInsight(apiKey, {
      nextMonth: forecast.nextMonth,
      threeMonth: forecast.threeMonth,
      annual: forecast.annual,
      trend: forecast.trend,
      trendPercent: forecast.trendPercent,
      currentMonthlyKg: monthlySummary?.total ?? 0,
      name: preferences?.name,
    })
      .then(setInsight)
      .catch(() => {})
      .finally(() => {
        setLoadingInsight(false);
        setAILoading(false);
      });
  }, [forecast?.trend]);

  if (!forecast) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-label="Loading forecast" />
      </div>
    );
  }

  const trendInfo = TREND_BADGE[forecast.trend];
  const TrendIcon = trendInfo.icon;

  const kpis = [
    { label: 'Next Month', value: formatCO2(forecast.nextMonth) },
    { label: '3 Months', value: formatCO2(forecast.threeMonth) },
    { label: '6 Months', value: formatCO2(forecast.sixMonth) },
    { label: 'Annual Projection', value: formatCO2(forecast.annual) },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground mt-1">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trend & Confidence */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trend:</span>
          <Badge variant={trendInfo.variant} className="flex items-center gap-1">
            <TrendIcon className="w-3 h-3" aria-hidden />
            {trendInfo.label}
            {forecast.trendPercent !== 0 && (
              <span className="ml-1">
                ({forecast.trendPercent > 0 ? '+' : ''}
                {forecast.trendPercent}%/month)
              </span>
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Confidence: {forecast.confidence}%
          </span>
          <Progress
            value={forecast.confidence}
            className="flex-1 h-2"
            aria-label={`Forecast confidence: ${forecast.confidence}%`}
          />
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Historical & Forecast Emissions</CardTitle>
        </CardHeader>
        <CardContent>
          <ForecastArea data={forecast.chartData} />
        </CardContent>
      </Card>

      {/* AI Insight */}
      {(insight || loadingInsight) && (
        <Card className="border-eco-200 dark:border-eco-800 bg-eco-50/50 dark:bg-eco-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-eco-600" aria-hidden />
              <span className="text-sm font-semibold text-eco-700 dark:text-eco-300">
                AI Forecast Insight
              </span>
            </div>
            {loadingInsight ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                Generating insight…
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
