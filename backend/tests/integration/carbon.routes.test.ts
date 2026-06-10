/**
 * Integration tests for carbon service with mocked DB
 */
jest.mock('../../src/config/database', () => ({
  default: {
    activity: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    carbonRecord: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../src/config/redis', () => ({
  getRedisClient: () => ({
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../../src/config/env', () => ({
  getEnv: () => ({
    NODE_ENV: 'test',
    JWT_SECRET: 'test_jwt_secret_that_is_at_least_32_chars_long!!',
    JWT_REFRESH_SECRET: 'test_refresh_secret_that_is_at_least_32_chars!!',
  }),
}));

import prisma from '../../src/config/database';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Carbon Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logActivity', () => {
    it('should calculate CO2e and save activity', async () => {
      (mockPrisma.activity.create as jest.Mock).mockResolvedValue({
        id: 'act_1',
        userId: 'user_1',
        category: 'transportation',
        subcategory: 'car_petrol',
        value: 100,
        unit: 'km',
        co2e: 21.233,
        date: new Date(),
        createdAt: new Date(),
      });
      (mockPrisma.carbonRecord.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.carbonRecord.create as jest.Mock).mockResolvedValue({});

      const { logActivity } = await import('../../src/services/carbon.service');
      const result = await logActivity('user_1', {
        category: 'transportation',
        subcategory: 'car_petrol',
        value: 100,
        unit: 'km',
      });

      expect(result.co2e).toBeCloseTo(21.233, 2);
      expect(mockPrisma.activity.create).toHaveBeenCalledTimes(1);
    });

    it('should return zero CO2e for bicycle', async () => {
      (mockPrisma.activity.create as jest.Mock).mockResolvedValue({
        id: 'act_2',
        userId: 'user_1',
        category: 'transportation',
        subcategory: 'bicycle',
        value: 10,
        unit: 'km',
        co2e: 0,
        date: new Date(),
        createdAt: new Date(),
      });
      (mockPrisma.carbonRecord.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.carbonRecord.create as jest.Mock).mockResolvedValue({});

      const { logActivity } = await import('../../src/services/carbon.service');
      const result = await logActivity('user_1', {
        category: 'transportation',
        subcategory: 'bicycle',
        value: 10,
        unit: 'km',
      });

      expect(result.co2e).toBe(0);
    });
  });

  describe('getActivityHistory', () => {
    it('should return paginated activities', async () => {
      const mockActivities = [
        { id: 'a1', category: 'food', co2e: 5.5, date: new Date(), subcategory: 'beef', value: 0.2, unit: 'kg', userId: 'u1', createdAt: new Date() },
        { id: 'a2', category: 'transportation', co2e: 2.1, date: new Date(), subcategory: 'car_petrol', value: 10, unit: 'km', userId: 'u1', createdAt: new Date() },
      ];
      (mockPrisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);
      (mockPrisma.activity.count as jest.Mock).mockResolvedValue(2);

      const { getActivityHistory } = await import('../../src/services/carbon.service');
      const result = await getActivityHistory('u1', { page: 1, limit: 20 });

      expect(result.activities).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });
});
