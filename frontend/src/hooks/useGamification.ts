'use client';

import { useState, useCallback } from 'react';
import { gamificationApi } from '@/src/lib/api';
import type { UserPoints, Badge, LeaderboardEntry } from '@/src/types';

export function useGamification() {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [badges, setBadges] = useState<{ earned: Badge[]; available: Badge[]; all: Badge[] } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await gamificationApi.getPoints();
      setPoints(res.data as UserPoints);
      return res.data as UserPoints;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load points');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await gamificationApi.getBadges();
      setBadges(res.data as typeof badges);
    } catch {}
  }, []);

  const fetchLeaderboard = useCallback(async (period?: string) => {
    try {
      const res = await gamificationApi.getLeaderboard(period);
      setLeaderboard((res.data ?? []) as LeaderboardEntry[]);
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([fetchPoints(), fetchBadges(), fetchLeaderboard()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPoints, fetchBadges, fetchLeaderboard]);

  return {
    points,
    badges,
    leaderboard,
    isLoading,
    error,
    fetchPoints,
    fetchBadges,
    fetchLeaderboard,
    fetchAll,
  };
}
