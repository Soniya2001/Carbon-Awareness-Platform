import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.utils';
import { unauthorized, forbidden } from '../utils/response.utils';
import { logger } from '../config/logger';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      unauthorized(res, 'No authentication token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      unauthorized(res, 'Invalid token format');
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Token verification failed';
    if (errorMessage.includes('expired')) {
      unauthorized(res, 'Token expired');
    } else {
      unauthorized(res, 'Invalid authentication token');
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, 'Authentication required');
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.userId} with role ${req.user.role}. Required: ${roles.join(', ')}`);
      forbidden(res, 'You do not have permission to access this resource');
      return;
    }

    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      if (token) {
        req.user = verifyAccessToken(token);
      }
    } catch {
      // Optional auth - silently fail
    }
  }
  next();
}
