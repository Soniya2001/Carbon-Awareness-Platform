import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { logger } from '../config/logger';
import {
  generateTokenPair,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
  TokenPair,
} from '../utils/jwt.utils';
import { cacheInvalidatePattern } from '../utils/cache.utils';

const BCRYPT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl: string | null;
    createdAt: Date;
  };
  tokens: TokenPair;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { email, name, password } = input;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  // Initialize leaderboard entry
  await prisma.leaderboard.create({
    data: {
      userId: user.id,
      score: 0,
      period: 'all-time',
    },
  });

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await storeRefreshToken(user.id, tokens.refreshToken);

  logger.info(`New user registered: ${email}`);
  return { user, tokens };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.password) {
    throw new Error('This account uses Google Sign-In. Please login with Google.');
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await storeRefreshToken(user.id, tokens.refreshToken);

  logger.info(`User logged in: ${email}`);

  const { password: _, ...safeUser } = user;
  return { user: safeUser, tokens };
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('Invalid or expired refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    // Token reuse detected - invalidate all tokens for this user
    logger.warn(`Refresh token reuse detected for user: ${payload.userId}`);
    await prisma.refreshToken.deleteMany({ where: { userId: payload.userId } });
    throw new Error('Refresh token reuse detected. Please login again.');
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new Error('Refresh token expired');
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const newTokens = generateTokenPair({
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  });

  await storeRefreshToken(storedToken.user.id, newTokens.refreshToken);
  return newTokens;
}

export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  } else {
    // Logout from all devices
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
  await cacheInvalidatePattern(`user:${userId}:*`);
  logger.info(`User logged out: ${userId}`);
}

export async function handleGoogleAuth(
  googleId: string,
  email: string,
  name: string,
  avatarUrl?: string
): Promise<AuthResult> {
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId,
        email,
        name,
        avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    await prisma.leaderboard.create({
      data: { userId: user.id, score: 0, period: 'all-time' },
    });
  } else if (!user.googleId) {
    // Link Google account to existing email account
    await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatarUrl },
    });
  }

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await storeRefreshToken(user.id, tokens.refreshToken);

  const { googleId: _, ...safeUser } = user;
  return { user: safeUser, tokens };
}

async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = getRefreshTokenExpiryDate();

  // Clean up expired tokens for this user
  await prisma.refreshToken.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

  await prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    throw new Error('User not found or uses social login');
  }

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  // Invalidate all sessions
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
