import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter, passwordResetLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase and a number'),
  ],
  validateRequest,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/profile
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('avatarUrl').optional().isURL().withMessage('Must be a valid URL'),
  ],
  validateRequest,
  authController.updateProfile
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authenticate,
  passwordResetLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase and a number'),
  ],
  validateRequest,
  authController.changePassword
);

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/error' }),
  authController.googleCallback
);

export default router;
