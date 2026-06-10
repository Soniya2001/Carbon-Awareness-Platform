import { Router } from 'express';
import { body } from 'express-validator';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

// GET /api/admin/analytics
router.get('/analytics', adminController.getPlatformAnalytics);

// GET /api/admin/challenges
router.get('/challenges', adminController.getChallenges);

// POST /api/admin/challenges
router.post(
  '/challenges',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['transportation', 'energy', 'food', 'shopping', 'waste']).withMessage('Invalid category'),
    body('targetValue').isFloat({ min: 0 }).withMessage('Target value must be positive'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('points').isInt({ min: 0 }).withMessage('Points must be a positive integer'),
    body('difficulty').isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Invalid difficulty'),
  ],
  validateRequest,
  adminController.createChallenge
);

// PUT /api/admin/challenges/:id
router.put('/challenges/:id', adminController.updateChallenge);

// DELETE /api/admin/challenges/:id
router.delete('/challenges/:id', adminController.deleteChallenge);

export default router;
