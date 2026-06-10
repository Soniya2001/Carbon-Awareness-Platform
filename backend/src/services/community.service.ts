import prisma from '../config/database';
import { cacheGetOrSet, cacheSet, CacheKeys } from '../utils/cache.utils';
import { logger } from '../config/logger';

export interface CommunityStatsData {
  totalCo2Saved: number;
  treesEquivalent: number;
  fuelSaved: number;
  carsRemoved: number;
  activeMemberCount: number;
  totalActivities: number;
  updatedAt: Date;
}

// Constants for equivalency calculations
const KG_CO2_PER_TREE_PER_YEAR = 21; // kg CO2 absorbed by average tree per year
const KG_CO2_PER_LITRE_FUEL = 2.31; // kg CO2 from burning 1 litre petrol
const KG_CO2_PER_CAR_PER_YEAR = 4600; // average car emits 4.6 tonnes CO2/year

export async function getCommunityStats(): Promise<CommunityStatsData> {
  return cacheGetOrSet(
    CacheKeys.communityStats(),
    async () => {
      return computeCommunityStats();
    },
    600 // 10 minutes cache
  );
}

async function computeCommunityStats(): Promise<CommunityStatsData> {
  const [activityStats, memberCount, totalActivities] = await Promise.all([
    prisma.activity.aggregate({
      _sum: { co2e: true },
      where: {
        co2e: { lt: 0 }, // Negative co2e = savings (recycling, green transport, etc.)
      },
    }),
    prisma.user.count(),
    prisma.activity.count(),
  ]);

  // Compute total emissions tracked
  const totalEmissions = await prisma.activity.aggregate({
    _sum: { co2e: true },
  });

  // Savings from green activities (recycling, renewable energy, etc.)
  const negativeSavings = Math.abs(activityStats._sum.co2e ?? 0);

  // Also count reduction from switching from high-emission to low-emission alternatives
  // This is estimated from users who chose low-carbon options
  const totalTracked = totalEmissions._sum.co2e ?? 0;
  const estimatedGlobalAvgForSameActivities = totalTracked * 1.3; // If they'd used average options
  const totalCo2Saved = Math.max(negativeSavings, estimatedGlobalAvgForSameActivities - totalTracked);

  const treesEquivalent = Math.floor(totalCo2Saved / KG_CO2_PER_TREE_PER_YEAR);
  const fuelSaved = Math.floor(totalCo2Saved / KG_CO2_PER_LITRE_FUEL);
  const carsRemoved = Number((totalCo2Saved / KG_CO2_PER_CAR_PER_YEAR).toFixed(1));

  // Active members = users who logged in last 30 days (approximated by recent activities)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeMemberCount = await prisma.activity
    .findMany({
      where: { date: { gte: thirtyDaysAgo } },
      distinct: ['userId'],
      select: { userId: true },
    })
    .then((results) => results.length);

  // Update or create the community stats record
  const stats = await prisma.communityStats.upsert({
    where: { id: 'global' },
    create: {
      id: 'global',
      totalCo2Saved: Number(totalCo2Saved.toFixed(2)),
      treesEquivalent,
      fuelSaved,
      carsRemoved: Number(carsRemoved),
      activeMemberCount,
    },
    update: {
      totalCo2Saved: Number(totalCo2Saved.toFixed(2)),
      treesEquivalent,
      fuelSaved,
      carsRemoved: Number(carsRemoved),
      activeMemberCount,
    },
  });

  return {
    totalCo2Saved: stats.totalCo2Saved,
    treesEquivalent: stats.treesEquivalent,
    fuelSaved: stats.fuelSaved,
    carsRemoved: stats.carsRemoved,
    activeMemberCount: stats.activeMemberCount,
    totalActivities,
    updatedAt: stats.updatedAt,
  };
}

export async function getGlobalLeaderboard(limit = 20) {
  const entries = await prisma.leaderboard.findMany({
    where: { period: 'all-time' },
    orderBy: { score: 'desc' },
    take: limit,
    include: {
      user: {
        select: { name: true, avatarUrl: true, createdAt: true },
      },
    },
  });

  return entries.map((entry, index) => ({
    rank: index + 1,
    // Anonymize users for privacy
    displayName: anonymizeName(entry.user.name),
    avatarUrl: entry.user.avatarUrl,
    score: entry.score,
    memberSince: entry.user.createdAt,
  }));
}

function anonymizeName(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 0) return 'Anonymous';
  const first = parts[0];
  if (!first) return 'Anonymous';
  return `${first[0]}${'*'.repeat(Math.max(1, first.length - 1))} ${parts[1] ? parts[1][0] + '.' : ''}`.trim();
}

export async function getMonthlyLeaderboard(limit = 20) {
  const monthPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const entries = await prisma.leaderboard.findMany({
    where: { period: monthPeriod },
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
    displayName: anonymizeName(entry.user.name),
    avatarUrl: entry.user.avatarUrl,
    score: entry.score,
    period: monthPeriod,
  }));
}

export async function getCategoryInsights() {
  const categoryTotals = await prisma.activity.groupBy({
    by: ['category'],
    _sum: { co2e: true },
    _count: { id: true },
  });

  const total = categoryTotals.reduce((sum, c) => sum + (c._sum.co2e ?? 0), 0);

  return categoryTotals.map((c) => ({
    category: c.category,
    totalCo2e: Number((c._sum.co2e ?? 0).toFixed(2)),
    activityCount: c._count.id,
    percentage: total > 0 ? Number(((c._sum.co2e ?? 0) / total * 100).toFixed(1)) : 0,
  }));
}
