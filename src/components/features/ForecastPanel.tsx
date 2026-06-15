'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ForecastArea } from '@/components/charts';
import { useAppStore } from '@/store/useAppStore';
import { forecastFromHistory, type ForecastResult } from '@/lib/simulationEngine';
import { generateForecastInsight } from '@/lib/aiClient';
import { formatCO2 } from '@/lib/utils';

const TREND = {
  increasing: { label: 'Increasing', variant: 'red'   as const, icon: TrendingUp  },
  stable:     { label: 'Stable',     variant: 'amber' as const, icon: Minus        },
  decreasing: { label: 'Decreasing', variant: 'eco'   as const, icon: TrendingDown },
};

export function ForecastPanel() {
  const { records, monthlySummary, setAILoading } = useAppStore();
  const [forecast, setForecast]             = useState<ForecastResult | null>(null);
  const [insight, setInsight]               = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const hasData = records.length >= 3;

  // Build forecast from activity records
  useEffect(() => {
    const dailyMap: Record<string, number> = {};
    for (const r of records) {
      dailyMap[r.date] = (dailyMap[r.date] ?? 0) + r.co2e;
    }
    setForecast(forecastFromHistory(Object.entries(dailyMap).map(([date, total]) => ({ date, total }))));
  }, [records]);

  // Fetch AI insight — always call, the route handles empty data gracefully
  useEffect(() => {
    if (!forecast) return;
    setLoadingInsight(true);
    setAILoading(true);
    generateForecastInsight({
      predicted: forecast.nextMonth,
      trend:     forecast.trend,
      period:    'next month',
      current:   monthlySummary?.total ?? 0,
    })
      .then(setInsight)
      .catch(() => setInsight('Log more activities to generate a forecast insight.'))
      .finally(() => { setLoadingInsight(false); setAILoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecast?.confidence]);

  if (!forecast) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-label="Loading forecast" />
      </div>
    );
  }

  const trendInfo = TREND[forecast.trend];
  const TrendIcon = trendInfo.icon;

  return (
    <div className="space-y-6">
      {/* Not enough data banner */}
      {!hasData && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Not enough data yet</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Log activities in the Calculator for at least 3 different days to build a meaningful forecast. The estimates below are based on global averages.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Next Month',  value: formatCO2(forecast.nextMonth)  },
          { label: '3 Months',   value: formatCO2(forecast.threeMonth) },
          { label: '6 Months',   value: formatCO2(forecast.sixMonth)   },
          { label: 'Annual',     value: formatCO2(forecast.annual)     },
        ].map(({ label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold mt-1">{value}</p>
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

      {/* AI Insight — always shown */}
      <Card className="border-eco-200 dark:border-eco-800 bg-eco-50/50 dark:bg-eco-900/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-eco-600" aria-hidden />
            <span className="text-sm font-semibold text-eco-700 dark:text-eco-300">AI Forecast Insight</span>
          </div>
          {loadingInsight ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Generating insight…
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{insight}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
