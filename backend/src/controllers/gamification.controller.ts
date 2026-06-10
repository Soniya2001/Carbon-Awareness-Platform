import { Request, Response, NextFunction } from 'express';
import * as gamificationService from '../services/gamification.service';
import { success } from '../utils/response.utils';

export async function getUserPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const points = await gamificationService.getUserPoints(userId);
    success(res, points);
  } catch (err) {
    next(err);
  }
}

export async function getBadges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const userPoints = await gamificationService.getUserPoints(userId);

    const allBadges = Object.values(gamificationService.BADGES).map((badge) => ({
      ...badge,
      earned: userPoints.badges.includes(badge.id),
    }));

    success(res, {
      earned: allBadges.filter((b) => b.earned),
      available: allBadges.filter((b) => !b.earned),
      all: allBadges,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { period = 'all-time', limit = '20' } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(
      period as string,
      parseInt(limit as string)
    );
    success(res, leaderboard);
  } catch (err) {
    next(err);
  }
}

export async function getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const userPoints = await gamificationService.getUserPoints(userId);

    const streak = await gamificationService.calculateStreak(userId);
    const rank = await gamificationService.getUserRank(userId);

    success(res, {
      totalPoints: userPoints.total,
      level: userPoints.level,
      nextLevelPoints: userPoints.nextLevelPoints,
      streak,
      rank,
      badgeCount: userPoints.badges.length,
      badges: userPoints.badges,
    });
  } catch (err) {
    next(err);
  }
}
