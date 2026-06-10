import { Request, Response, NextFunction } from 'express';
import * as communityService from '../services/community.service';
import { success } from '../utils/response.utils';

export async function getCommunityStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await communityService.getCommunityStats();
    success(res, stats);
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { period = 'all-time', limit = '20' } = req.query;
    let leaderboard;

    if (period === 'monthly') {
      leaderboard = await communityService.getMonthlyLeaderboard(parseInt(limit as string));
    } else {
      leaderboard = await communityService.getGlobalLeaderboard(parseInt(limit as string));
    }

    success(res, leaderboard);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryInsights(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const insights = await communityService.getCategoryInsights();
    success(res, insights);
  } catch (err) {
    next(err);
  }
}
