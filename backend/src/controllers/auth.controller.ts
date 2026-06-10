import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { success, created, badRequest, unauthorized } from '../utils/response.utils';
import { logger } from '../config/logger';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, name, password } = req.body;
    const result = await authService.register({ email, name, password });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    created(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, 'Account created successfully');
  } catch (err) {
    if (err instanceof Error && err.message.includes('already registered')) {
      badRequest(res, err.message);
    } else {
      next(err);
    }
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    success(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
    }, 'Login successful');
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Invalid') || err.message.includes('Google'))) {
      unauthorized(res, err.message);
    } else {
      next(err);
    }
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    await authService.logout(userId, refreshToken);

    res.clearCookie('refreshToken');
    success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      unauthorized(res, 'No refresh token provided');
      return;
    }

    const tokens = await authService.refreshTokens(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    success(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (err) {
    if (err instanceof Error && (err.message.includes('expired') || err.message.includes('Invalid'))) {
      res.clearCookie('refreshToken');
      unauthorized(res, err.message);
    } else {
      next(err);
    }
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getUserById(req.user!.userId);
    if (!user) {
      unauthorized(res, 'User not found');
      return;
    }
    success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  try {
    const profile = req.user as {
      id: string;
      emails?: Array<{ value: string }>;
      displayName: string;
      photos?: Array<{ value: string }>;
    };

    const email = profile.emails?.[0]?.value;
    if (!email) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=no_email`);
      return;
    }

    const result = await authService.handleGoogleAuth(
      profile.id,
      email,
      profile.displayName,
      profile.photos?.[0]?.value
    );

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${result.tokens.accessToken}`
    );
  } catch (err) {
    logger.error('Google OAuth callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=oauth_failed`);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, avatarUrl } = req.body;
    const updated = await authService.updateUserProfile(req.user!.userId, { name, avatarUrl });
    success(res, updated, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    success(res, null, 'Password changed successfully');
  } catch (err) {
    if (err instanceof Error && err.message.includes('incorrect')) {
      badRequest(res, err.message);
    } else {
      next(err);
    }
  }
}
