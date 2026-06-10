import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service';
import * as carbonService from '../services/carbon.service';
import * as gamificationService from '../services/gamification.service';
import { success, badRequest } from '../utils/response.utils';
import { BADGES } from '../services/gamification.service';

export async function explainFootprint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { period = 'this month' } = req.body;

    const summary = await carbonService.getMonthlySummary(userId);
    const explanation = await aiService.explainFootprint({
      totalCo2e: summary.totalCo2e,
      byCategory: summary.byCategory,
      averageDaily: summary.averageDaily,
      comparedToGlobal: summary.comparedToGlobal,
      period,
    });

    success(res, { explanation, summary });
  } catch (err) {
    next(err);
  }
}

export async function generateRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const summary = await carbonService.getMonthlySummary(userId);

    const recommendations = await aiService.generateRecommendations({
      totalCo2e: summary.totalCo2e,
      byCategory: summary.byCategory,
    });

    success(res, { recommendations });
  } catch (err) {
    next(err);
  }
}

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      badRequest(res, 'Message is required');
      return;
    }

    const summary = await carbonService.getMonthlySummary(userId).catch(() => null);

    const topCategory = summary
      ? Object.entries(summary.byCategory).sort(([, a], [, b]) => b - a)[0]?.[0]
      : undefined;

    const response = await aiService.chatWithCoach(message, history, {
      totalCo2e: summary?.totalCo2e,
      topCategory,
      sustainabilityScore: summary?.sustainabilityScore,
    });

    // Award badge for AI interaction
    await gamificationService.addPoints(userId, 5, 'AI chat interaction');

    // Track AI conversations
    const chatCount = (req.session as Record<string, unknown>)?.aiChatCount as number ?? 0;
    if (chatCount >= 4) {
      await gamificationService.awardBadge(userId, BADGES.AI_STUDENT.id);
    }

    success(res, { response, message });
  } catch (err) {
    next(err);
  }
}

export async function generateChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const summary = await carbonService.getMonthlySummary(userId).catch(() => null);

    const topCategories = summary
      ? Object.entries(summary.byCategory)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([cat]) => cat)
      : ['transportation', 'food', 'energy'];

    const challenge = await aiService.generateAIChallenge({
      topCategories,
      currentCo2e: summary?.totalCo2e ?? 400,
      completedChallenges: [],
    });

    success(res, { challenge });
  } catch (err) {
    next(err);
  }
}
