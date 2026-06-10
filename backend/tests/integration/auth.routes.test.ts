/**
 * Integration tests for auth routes.
 * These tests require a running database and redis instance.
 * Use mocked versions in CI.
 */

// Mock the database and redis
jest.mock('../../src/config/database', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    leaderboard: {
      create: jest.fn(),
    },
  },
  connectDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/config/redis', () => ({
  getRedisClient: () => ({
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    on: jest.fn(),
    quit: jest.fn(),
  }),
  disconnectRedis: jest.fn(),
}));

jest.mock('../../src/config/env', () => ({
  validateEnv: jest.fn(),
  getEnv: () => ({
    NODE_ENV: 'test',
    PORT: 4001,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'test_jwt_secret_that_is_at_least_32_chars_long!!',
    JWT_REFRESH_SECRET: 'test_refresh_secret_that_is_at_least_32_chars!!',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    FRONTEND_URL: 'http://localhost:3000',
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    AUTH_RATE_LIMIT_MAX: 10,
  }),
}));

import { hashPassword } from '../../src/services/auth.service';
import prisma from '../../src/config/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Auth Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should reject duplicate email', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing_user',
        email: 'test@example.com',
      });

      const { register } = await import('../../src/services/auth.service');
      await expect(
        register({ email: 'test@example.com', name: 'Test', password: 'Test1234!' })
      ).rejects.toThrow('already registered');
    });

    it('should create user with hashed password', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new_user_id',
        email: 'new@example.com',
        name: 'New User',
        role: 'USER',
        avatarUrl: null,
        createdAt: new Date(),
      });
      (mockPrisma.leaderboard.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.refreshToken.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({});

      const { register } = await import('../../src/services/auth.service');
      const result = await register({
        email: 'new@example.com',
        name: 'New User',
        password: 'Test1234!',
      });

      expect(result.user.email).toBe('new@example.com');
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();
    });
  });

  describe('login', () => {
    it('should reject invalid credentials', async () => {
      const hashed = await hashPassword('CorrectPassword1!');
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_id',
        email: 'test@example.com',
        name: 'Test User',
        password: hashed,
        role: 'USER',
        avatarUrl: null,
        createdAt: new Date(),
      });
      (mockPrisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({});

      const { login } = await import('../../src/services/auth.service');
      await expect(
        login({ email: 'test@example.com', password: 'WrongPassword1!' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return tokens on successful login', async () => {
      const hashed = await hashPassword('CorrectPassword1!');
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_id',
        email: 'test@example.com',
        name: 'Test User',
        password: hashed,
        role: 'USER',
        avatarUrl: null,
        createdAt: new Date(),
      });
      (mockPrisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({});
      (mockPrisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const { login } = await import('../../src/services/auth.service');
      const result = await login({ email: 'test@example.com', password: 'CorrectPassword1!' });

      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
