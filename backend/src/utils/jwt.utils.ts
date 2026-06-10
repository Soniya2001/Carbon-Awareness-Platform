import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { getEnv } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const env = getEnv();
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as string,
    issuer: 'carbonwise-api',
    audience: 'carbonwise-client',
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const env = getEnv();
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
    issuer: 'carbonwise-api',
    audience: 'carbonwise-client',
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function generateTokenPair(payload: TokenPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): TokenPayload {
  const env = getEnv();
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'carbonwise-api',
    audience: 'carbonwise-client',
  }) as JwtPayload & TokenPayload;

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
}

export function verifyRefreshToken(token: string): TokenPayload {
  const env = getEnv();
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'carbonwise-api',
    audience: 'carbonwise-client',
  }) as JwtPayload & TokenPayload;

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
}

export function getRefreshTokenExpiryDate(): Date {
  const env = getEnv();
  const expiry = env.JWT_REFRESH_EXPIRES_IN;
  const ms = parseExpiry(expiry);
  return new Date(Date.now() + ms);
}

function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000; // 7 days default
  }
}
