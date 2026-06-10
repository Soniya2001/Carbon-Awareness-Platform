import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { success, created, notFound, paginated } from '../utils/response.utils';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? {
          OR: [
            { email: { contains: search as string, mode: 'insensitive' as const } },
            { name: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              activities: true,
              carbonRecords: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    paginated(res, users, total, pageNum, limitNum);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      notFound(res, 'User not found');
      return;
    }

    await prisma.user.delete({ where: { id } });
    success(res, null, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
}

export async function getPlatformAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      newUsersThisMonth,
      totalActivities,
      activitiesThisMonth,
      totalCo2Tracked,
      challengesCompleted,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.activity.count(),
      prisma.activity.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.activity.aggregate({ _sum: { co2e: true } }),
      prisma.challengeProgress.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Daily signups for last 30 days
    const dailySignups = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    success(res, {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        dailySignups: dailySignups.map((d: { date: Date; count: bigint }) => ({
          date: d.date,
          count: Number(d.count),
        })),
      },
      activities: {
        total: totalActivities,
        thisMonth: activitiesThisMonth,
        totalCo2Tracked: Number((totalCo2Tracked._sum.co2e ?? 0).toFixed(2)),
      },
      challenges: {
        completed: challengesCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        _count: { select: { progress: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    success(res, challenges);
  } catch (err) {
    next(err);
  }
}

export async function createChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, category, targetValue, unit, points, difficulty } = req.body;

    const challenge = await prisma.challenge.create({
      data: { title, description, category, targetValue: Number(targetValue), unit, points: Number(points), difficulty },
    });

    created(res, challenge, 'Challenge created');
  } catch (err) {
    next(err);
  }
}

export async function updateChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const challenge = await prisma.challenge.update({
      where: { id },
      data,
    });

    success(res, challenge, 'Challenge updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.challenge.delete({ where: { id } });
    success(res, null, 'Challenge deleted');
  } catch (err) {
    next(err);
  }
}
