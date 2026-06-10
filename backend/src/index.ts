import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { validateEnv, getEnv } from './config/env';
import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { logger } from './config/logger';
import { apiRateLimiter } from './middleware/rateLimiter.middleware';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import carbonRoutes from './routes/carbon.routes';
import aiRoutes from './routes/ai.routes';
import simulationRoutes from './routes/simulation.routes';
import forecastRoutes from './routes/forecast.routes';
import challengeRoutes from './routes/challenge.routes';
import communityRoutes from './routes/community.routes';
import adminRoutes from './routes/admin.routes';
import gamificationRoutes from './routes/gamification.routes';

// Validate env before anything else
validateEnv();
const env = getEnv();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Core Middleware ──────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.path === '/health',
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────
app.use('/api', apiRateLimiter);

// ─── Passport / Google OAuth ──────────────────────────────────────────
app.use(passport.initialize());

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );
}

// ─── Health Check ─────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────
const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/carbon`, carbonRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/simulation`, simulationRoutes);
app.use(`${API_PREFIX}/forecast`, forecastRoutes);
app.use(`${API_PREFIX}/challenges`, challengeRoutes);
app.use(`${API_PREFIX}/community`, communityRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/gamification`, gamificationRoutes);

// ─── Error Handling ───────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Bootstrap ─────────────────────────────────────────────────
async function bootstrap() {
  try {
    await connectDatabase();
    getRedisClient(); // Eagerly connect Redis

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 CarbonWise API running on port ${env.PORT} (${env.NODE_ENV})`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const { disconnectDatabase } = await import('./config/database');
        const { disconnectRedis } = await import('./config/redis');
        await Promise.all([disconnectDatabase(), disconnectRedis()]);
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

export default app;
