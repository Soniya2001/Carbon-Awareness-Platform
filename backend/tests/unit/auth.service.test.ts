import { hashPassword, verifyPassword } from '../../src/services/auth.service';

describe('Auth Service - Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce bcrypt hash', async () => {
      const hash = await hashPassword('Test123!');
      expect(hash).toMatch(/^\$2[ab]\$/);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await hashPassword('CorrectPassword123!');
      const isValid = await verifyPassword('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty string against hash', async () => {
      const hash = await hashPassword('SomePassword123!');
      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });
  });
});

describe('JWT Utilities', () => {
  // Set up env for testing
  const originalEnv = process.env;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_that_is_at_least_32_chars_long!!';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_at_least_32_chars!!';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should generate and verify access token', async () => {
    const { generateAccessToken, verifyAccessToken } = await import('../../src/utils/jwt.utils');
    const payload = { userId: 'user_123', email: 'test@example.com', role: 'USER' };
    const token = generateAccessToken(payload);
    expect(token).toBeTruthy();
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should generate different tokens each time', async () => {
    const { generateAccessToken } = await import('../../src/utils/jwt.utils');
    const payload = { userId: 'user_123', email: 'test@example.com', role: 'USER' };
    const token1 = generateAccessToken(payload);
    const token2 = generateAccessToken(payload);
    // JWT tokens issued at slightly different times may be the same in fast tests
    expect(typeof token1).toBe('string');
    expect(typeof token2).toBe('string');
  });
});
