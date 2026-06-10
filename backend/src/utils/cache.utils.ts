import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    logger.error('Cache GET error:', err);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.error('Cache SET error:', err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (err) {
    logger.error('Cache DEL error:', err);
  }
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      logger.debug(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    logger.error('Cache INVALIDATE error:', err);
  }
}

export async function cacheGetOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }
  const data = await fetchFn();
  await cacheSet(key, data, ttlSeconds);
  return data;
}

export function buildCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

// Cache key builders
export const CacheKeys = {
  userProfile: (userId: string) => `user:${userId}:profile`,
  carbonSummary: (userId: string, period: string) => `carbon:${userId}:summary:${period}`,
  carbonHistory: (userId: string, page: number) => `carbon:${userId}:history:${page}`,
  forecast: (userId: string, period: string) => `forecast:${userId}:${period}`,
  leaderboard: (period: string) => `leaderboard:${period}`,
  communityStats: () => 'community:stats',
  challenges: () => 'challenges:active',
  userAchievements: (userId: string) => `achievements:${userId}`,
  gamification: (userId: string) => `gamification:${userId}`,
};
