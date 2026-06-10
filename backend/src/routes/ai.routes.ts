import { Router } from 'express';
import { body } from 'express-validator';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);
router.use(aiRateLimiter);

// POST /api/ai/explain
router.post('/explain', aiController.explainFootprint);

// POST /api/ai/recommend
router.post('/recommend', aiController.generateRecommendations);

// POST /api/ai/chat
router.post(
  '/chat',
  [
    body('message').notEmpty().isLength({ max: 1000 }).withMessage('Message must be 1-1000 characters'),
    body('history').optional().isArray().withMessage('History must be an array'),
  ],
  validateRequest,
  aiController.chat
);

// POST /api/ai/challenge
router.post('/challenge', aiController.generateChallenge);

export default router;
