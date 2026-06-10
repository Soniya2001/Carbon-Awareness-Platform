'use client';

import { useCallback, useEffect } from 'react';
import { carbonApi } from '@/src/lib/api';
import { useCarbonStore } from '@/src/store/useCarbonStore';
import type { ActivityInput, FootprintSummary, Activity } from '@/src/types';

export function useCarbon() {
  const {
    activities,
    summary,
    weeklyRecords,
    todayRecord,
    isLoading,
    error,
    setActivities,
    addActivity,
    removeActivity,
    setSummary,
    setWeeklyRecords,
    setTodayRecord,
    setLoading,
    setError,
  } = useCarbonStore();

  const logActivity = useCallback(async (input: ActivityInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await carbonApi.logActivity(input);
      const activityData = (res.data as { activity: Activity }).activity;
      addActivity(activityData);
      return activityData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log activity';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, addActivity]);

  const fetchSummary = useCallback(async (year?: number, month?: number) => {
    setLoading(true);
    try {
      const res = await carbonApi.getMonthlySummary(year, month);
      setSummary(res.data as FootprintSummary);
      return res.data as FootprintSummary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSummary]);

  const fetchWeekly = useCallback(async () => {
    try {
      const res = await carbonApi.getWeeklySummary();
      setWeeklyRecords((res.data as typeof weeklyRecords) ?? []);
    } catch {}
  }, [setWeeklyRecords]);

  const fetchToday = useCallback(async () => {
    try {
      const res = await carbonApi.getDailySummary();
      setTodayRecord(res.data as typeof todayRecord);
    } catch {}
  }, [setTodayRecord]);

  const fetchHistory = useCallback(async (params?: Parameters<typeof carbonApi.getHistory>[0]) => {
    setLoading(true);
    try {
      const res = await carbonApi.getHistory(params);
      setActivities((res.data as unknown as { activities: Activity[] })?.activities ?? []);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setActivities]);

  const deleteActivity = useCallback(async (id: string) => {
    await carbonApi.deleteActivity(id);
    removeActivity(id);
  }, [removeActivity]);

  return {
    activities,
    // 'history' alias used by dashboard/analytics pages
    history: activities as unknown as (typeof activities[0] & { total: number; date: string })[],
    summary,
    weeklyRecords,
    todayRecord,
    isLoading,
    error,
    logActivity,
    fetchSummary,
    fetchWeekly,
    fetchToday,
    fetchHistory,
    deleteActivity,
  };
}
