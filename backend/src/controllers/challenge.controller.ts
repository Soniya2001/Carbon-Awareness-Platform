import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import * as gamificationService from '../services/gamification.service';
import { success, created, notFound, badRequest } from '../utils/response.utils';
import { BADGES } from '../services/gamification.service';

export async function getChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { difficulty, category } = req.query;

    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        ...(difficulty && { difficulty: difficulty as string }),
        ...(category && { category: category as string }),
      },
      include: {
        progress: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = challenges.map((c) => ({
      ...c,
      userProgress: c.progress[0] ?? null,
      progress: undefined,
    }));

    success(res, enriched);
  } catch (err) {
    next(err);
  }
}

export async function getActiveChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const progress = await prisma.challengeProgress.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { challenge: true },
      orderBy: { createdAt: 'desc' },
    });

    success(res, progress);
  } catch (err) {
    next(err);
  }
}

export async function getCompletedChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const progress = await prisma.challengeProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { challenge: true },
      orderBy: { completedAt: 'desc' },
    });

    success(res, progress);
  } catch (err) {
    next(err);
  }
}

export async function joinChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { challengeId } = req.body;

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      notFound(res, 'Challenge not found');
      return;
    }

    const existing = await prisma.challengeProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });

    if (existing) {
      badRequest(res, 'Already joined this challenge');
      return;
    }

    const progress = await prisma.challengeProgress.create({
      data: { userId, challengeId, status: 'ACTIVE', progress: 0 },
      include: { challenge: true },
    });

    await gamificationService.addPoints(userId, 5, 'Joined challenge');
    created(res, progress, 'Challenge joined successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { challengeId, progress: progressValue } = req.body;

    const progressRecord = await prisma.challengeProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      include: { challenge: true },
    });

    if (!progressRecord) {
      notFound(res, 'Challenge progress not found');
      return;
    }

    const newProgress = Math.min(progressValue, progressRecord.challenge.targetValue);
    const isCompleted = newProgress >= progressRecord.challenge.targetValue;

    const updated = await prisma.challengeProgress.update({
      where: { userId_challengeId: { userId, challengeId } },
      data: {
        progress: newProgress,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: isCompleted ? new Date() : null,
      },
      include: { challenge: true },
    });

    if (isCompleted) {
      await gamificationService.addPoints(userId, progressRecord.challenge.points, `Challenge completed: ${progressRecord.challenge.title}`);
      await gamificationService.awardBadge(userId, BADGES.CHALLENGE_COMPLETE.id);

      await prisma.notification.create({
        data: {
          userId,
          title: '🎉 Challenge Completed!',
          message: `You completed "${progressRecord.challenge.title}" and earned ${progressRecord.challenge.points} points!`,
          type: 'achievement',
        },
      });
    }

    success(res, updated, isCompleted ? 'Challenge completed! Points awarded.' : 'Progress updated');
  } catch (err) {
    next(err);
  }
}
