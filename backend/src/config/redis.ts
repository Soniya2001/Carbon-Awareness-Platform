import Redis from 'ioredis';
import { getEnv } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export function createRedisClient(): Redis {
  const env = getEnv();

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  client.on('error', (err: Error) => {
    logger.error('❌ Redis error:', err);
  });

  client.on('close', () => {
    logger.warn('Redis connection closed');
  });

  client.on('reconnecting', () => {
    logger.info('Redis reconnecting...');
  });

  return client;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}

export default getRedisClient;
