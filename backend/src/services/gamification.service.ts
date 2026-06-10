import prisma from '../config/database';
import { cacheInvalidatePattern, cacheGetOrSet, CacheKeys } from '../utils/cache.utils';
import { logger } from '../config/logger';

export const BADGES = {
  FIRST_STEP: { id: 'first_step', name: 'First Step', description: 'Logged your first carbon activity', points: 50 },
  WEEK_STREAK: { id: 'week_streak', name: 'Week Warrior', description: 'Logged activities 7 days in a row', points: 100 },
  MONTH_STREAK: { id: 'month_streak', name: 'Monthly Master', description: 'Logged activities 30 days in a row', points: 300 },
  LOW_CARBON_DAY: { id: 'low_carbon_day', name: 'Green Day', description: 'Had a day under 5 kg CO2e', points: 75 },
  CHALLENGE_COMPLETE: { id: 'challenge_complete', name: 'Challenge Champion', description: 'Completed your first challenge', points: 150 },
  TRANSPORT_HERO: { id: 'transport_hero', name: 'Transport Hero', description: 'Avoided 100 km of car travel', points: 200 },
  FOOD_CONSCIOUS: { id: 'food_conscious', name: 'Food Conscious', description: 'Logged 30 days of food tracking', points: 200 },
  ENERGY_SAVER: { id: 'energy_saver', name: 'Energy Saver', description: 'Reduced energy footprint by 20%', points: 250 },
  COMMUNITY_STAR: { id: 'community_star', name: 'Community Star', description: 'Top 10% on the leaderboard', points: 300 },
  ECO_LEGEND: { id: 'eco_legend', name: 'Eco Legend', description: 'Reached 1000 eco points', points: 500 },
  ZERO_WASTE: { id: 'zero_waste', name: 'Zero Waste Hero', description: 'Logged composting or recycling 10 times', points: 150 },
  AI_STUDENT: { id: 'ai_student', name: 'AI Student', description: 'Had 5 conversations with AI Coach', points: 100 },
  TWIN_EXPLORER: { id: 'twin_explorer', name: 'Twin Explorer', description: 'Run your first Carbon Twin simulation', points: 100 },
  FORECASTER: { id: 'forecaster', name: 'Forecaster', description: 'Checked your forecast 5 times', points: 75 },
};

export interface UserPoints {
  total: number;
  rank: number | null;
  badges: string[];
  streak: number;
  level: string;
  nextLevelPoints: number;
}

function getLevel(points: number): { level: string; nextLevelPoints: number } {
  if (points < 100) return { level: 'Seedling 🌱', nextLevelPoints: 100 };
  if (points < 300) return { level: 'Sprout 🌿', nextLevelPoints: 300 };
  if (points < 600) return { level: 'Sapling 🌳', nextLevelPoints: 600 };
  if (points < 1000) return { level: 'Tree 🌲', nextLevelPoints: 1000 };
  if (points < 2000) return { level: 'Forest 🌳🌲', nextLevelPoints: 2000 };
  if (points < 5000) return { level: 'Eco Warrior ⚔️', nextLevelPoints: 5000 };
  return { level: 'Eco Legend 🏆', nextLevelPoints: Infinity };
}

export async function addPoints(userId: string, points: number, reason: string): Promise<number> {
  try {
    const entry = await prisma.leaderboard.upsert({
      where: { userId_period: { userId, period: 'all-time' } },
      create: { userId, score: points, period: 'all-time' },
      update: { score: { increment: points } },
    });

    // Also update monthly leaderboard
    const monthPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    await prisma.leaderboard.upsert({
      where: { userId_period: { userId, period: monthPeriod } },
      create: { userId, score: points, period: monthPeriod },
      update: { score: { increment: points } },
    });

    logger.debug(`Added ${points} points to user ${userId} for: ${reason}`);
    await cacheInvalidatePattern(`gamification:${userId}`);
    await cacheInvalidatePattern('leaderboard:*');

    return entry.score;
  } catch (err) {
    logger.error('Error adding points:', err);
    return 0;
  }
}

export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const existing = await prisma.achievement.findUnique({
      where: { userId_badge: { userId, badge: badgeId } },
    });

    if (existing) return false; // Already has badge

    await prisma.achievement.create({
      data: { userId, badge: badgeId },
    });

    const badge = Object.values(BADGES).find((b) => b.id === badgeId);
    if (badge) {
      await addPoints(userId, badge.points, `Badge earned: ${badge.name}`);
    }

    // Send notification
    const badgeInfo = Object.values(BADGES).find((b) => b.id === badgeId);
    if (badgeInfo) {
      await prisma.notification.create({
        data: {
          userId,
          title: '🏆 New Badge Earned!',
          message: `Congratulations! You earned the "${badgeInfo.name}" badge: ${badgeInfo.description}`,
          type: 'achievement',
        },
      });
    }

    logger.info(`Badge ${badgeId} awarded to user ${userId}`);
    return true;
  } catch (err) {
    logger.error('Error awarding badge:', err);
    return false;
  }
}

export async function getUserPoints(userId: string): Promise<UserPoints> {
  return cacheGetOrSet(
    CacheKeys.gamification(userId),
    async () => {
      const [leaderboard, achievements] = await Promise.all([
        prisma.leaderboard.findUnique({
          where: { userId_period: { userId, period: 'all-time' } },
        }),
        prisma.achievement.findMany({
          where: { userId },
          orderBy: { earnedAt: 'desc' },
        }),
      ]);

      const totalPoints = leaderboard?.score ?? 0;
      const badges = achievements.map((a) => a.badge);
      const { level, nextLevelPoints } = getLevel(totalPoints);

      // Calculate streak
      const streak = await calculateStreak(userId);

      // Get rank
      const rank = await getUserRank(userId);

      return {
        total: totalPoints,
        rank,
        badges,
        streak,
        level,
        nextLevelPoints,
      };
    },
    300
  );
}

export async function calculateStreak(userId: string): Promise<number> {
  const records = await prisma.carbonRecord.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 60,
    select: { date: true },
  });

  if (records.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);

  for (const record of records) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (recordDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  return streak;
}

export async function getUserRank(userId: string): Promise<number | null> {
  const higherScores = await prisma.leaderboard.count({
    where: {
      period: 'all-time',
      score: {
        gt: (
          await prisma.leaderboard.findUnique({
            where: { userId_period: { userId, period: 'all-time' } },
          })
        )?.score ?? 0,
      },
    },
  });

  return higherScores + 1;
}

export async function getLeaderboard(period: string, limit = 20) {
  return cacheGetOrSet(
    CacheKeys.leaderboard(period),
    async () => {
      const entries = await prisma.leaderboard.findMany({
        where: { period },
        orderBy: { score: 'desc' },
        take: limit,
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      });

      return entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        name: entry.user.name,
        avatarUrl: entry.user.avatarUrl,
        score: entry.score,
      }));
    },
    300
  );
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = [];

  // Check first activity
  const activityCount = await prisma.activity.count({ where: { userId } });
  if (activityCount >= 1) {
    const given = await awardBadge(userId, BADGES.FIRST_STEP.id);
    if (given) awarded.push(BADGES.FIRST_STEP.id);
  }

  // Check streak badges
  const streak = await calculateStreak(userId);
  if (streak >= 7) {
    const given = await awardBadge(userId, BADGES.WEEK_STREAK.id);
    if (given) awarded.push(BADGES.WEEK_STREAK.id);
  }
  if (streak >= 30) {
    const given = await awardBadge(userId, BADGES.MONTH_STREAK.id);
    if (given) awarded.push(BADGES.MONTH_STREAK.id);
  }

  // Check eco legend (1000 points)
  const points = await prisma.leaderboard.findUnique({
    where: { userId_period: { userId, period: 'all-time' } },
  });
  if ((points?.score ?? 0) >= 1000) {
    const given = await awardBadge(userId, BADGES.ECO_LEGEND.id);
    if (given) awarded.push(BADGES.ECO_LEGEND.id);
  }

  return awarded;
}
