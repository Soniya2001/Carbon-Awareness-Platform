import { Router } from 'express';
import * as gamificationController from '../controllers/gamification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// GET /api/gamification/points
router.get('/points', gamificationController.getUserPoints);

// GET /api/gamification/badges
router.get('/badges', gamificationController.getBadges);

// GET /api/gamification/leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

// GET /api/gamification/achievements
router.get('/achievements', gamificationController.getAchievements);

export default router;
