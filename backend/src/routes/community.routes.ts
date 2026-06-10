import { Router } from 'express';
import * as communityController from '../controllers/community.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/community/stats (public)
router.get('/stats', communityController.getCommunityStats);

// GET /api/community/leaderboard (public)
router.get('/leaderboard', communityController.getLeaderboard);

// GET /api/community/insights (public)
router.get('/insights', communityController.getCategoryInsights);

export default router;
