'use client';

import { useState, useCallback } from 'react';
import { forecastApi } from '@/src/lib/api';
import type { ForecastResult, ForecastSeries } from '@/src/types';

export function useForecast() {
  const [series, setSeries] = useState<ForecastSeries | null>(null);
  const [monthly, setMonthly] = useState<ForecastResult | null>(null);
  const [quarterly, setQuarterly] = useState<ForecastResult[]>([]);
  const [annual, setAnnual] = useState<ForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [seriesRes, monthlyRes, quarterlyRes, annualRes] = await Promise.allSettled([
        forecastApi.getFullSeries(),
        forecastApi.getMonthly(),
        forecastApi.getQuarterly(),
        forecastApi.getAnnual(),
      ]);

      if (seriesRes.status === 'fulfilled') setSeries(seriesRes.value.data as ForecastSeries);
      if (monthlyRes.status === 'fulfilled') setMonthly(monthlyRes.value.data as ForecastResult);
      if (quarterlyRes.status === 'fulfilled') setQuarterly((quarterlyRes.value.data ?? []) as ForecastResult[]);
      if (annualRes.status === 'fulfilled') setAnnual(annualRes.value.data as ForecastResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecasts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    series,
    monthly,
    quarterly,
    annual,
    isLoading,
    error,
    fetchAll,
  };
}
