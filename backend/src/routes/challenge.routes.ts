import { Router } from 'express';
import { body } from 'express-validator';
import * as challengeController from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// GET /api/challenges
router.get('/', challengeController.getChallenges);

// GET /api/challenges/active
router.get('/active', challengeController.getActiveChallenges);

// GET /api/challenges/completed
router.get('/completed', challengeController.getCompletedChallenges);

// POST /api/challenges/join
router.post(
  '/join',
  [body('challengeId').notEmpty().withMessage('Challenge ID is required')],
  validateRequest,
  challengeController.joinChallenge
);

// PUT /api/challenges/progress
router.put(
  '/progress',
  [
    body('challengeId').notEmpty().withMessage('Challenge ID is required'),
    body('progress').isFloat({ min: 0 }).withMessage('Progress must be a non-negative number'),
  ],
  validateRequest,
  challengeController.updateProgress
);

export default router;
