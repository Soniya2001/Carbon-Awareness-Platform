import rateLimit from 'express-rate-limit';
import { getEnv } from '../config/env';
import { error } from '../utils/response.utils';

const env = getEnv();

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    error(res, 'Too many requests. Please try again later.', 429);
  },
  skip: (req) => req.path === '/health',
});

// Stricter rate limiter for auth routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    error(res, 'Too many authentication attempts. Please try again in 15 minutes.', 429);
  },
  skipSuccessfulRequests: true,
});

// AI endpoint rate limiter (more generous)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    error(res, 'AI request limit reached. Please wait before making more AI requests.', 429);
  },
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    error(res, 'Too many password reset attempts. Please try again in an hour.', 429);
  },
});
