import prisma from '../config/database';
import { calculateEmissions, CategoryKey, GLOBAL_BENCHMARKS } from '../utils/carbonFactors';
import { cacheSet, cacheGet, cacheInvalidatePattern, CacheKeys } from '../utils/cache.utils';
import { logger } from '../config/logger';

export interface ActivityInput {
  category: CategoryKey;
  subcategory: string;
  value: number;
  unit: string;
  date?: Date;
}

export interface DailyRecord {
  date: Date;
  transportation: number;
  energy: number;
  food: number;
  shopping: number;
  waste: number;
  total: number;
}

export interface FootprintSummary {
  totalCo2e: number;
  byCategory: Record<string, number>;
  averageDaily: number;
  comparedToGlobal: number;
  sustainabilityScore: number;
  trend: 'improving' | 'stable' | 'worsening';
  percentileRank: number;
}

export async function logActivity(userId: string, input: ActivityInput) {
  const co2e = calculateEmissions(input.category, input.subcategory, input.value);

  const activity = await prisma.activity.create({
    data: {
      userId,
      category: input.category,
      subcategory: input.subcategory,
      value: input.value,
      unit: input.unit,
      co2e,
      date: input.date ?? new Date(),
    },
  });

  // Update or create today's carbon record
  await updateDailyRecord(userId, input.category, co2e, input.date);

  // Invalidate user caches
  await cacheInvalidatePattern(`carbon:${userId}:*`);
  await cacheInvalidatePattern(`forecast:${userId}:*`);

  return { ...activity, co2e };
}

async function updateDailyRecord(
  userId: string,
  category: string,
  co2e: number,
  date?: Date
): Promise<void> {
  const targetDate = date ?? new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.carbonRecord.findFirst({
    where: { userId, date: { gte: dayStart, lte: dayEnd } },
  });

  const update: Record<string, unknown> = {};
  const validCategories = ['transportation', 'energy', 'food', 'shopping', 'waste'];
  if (validCategories.includes(category)) {
    update[category] = { increment: co2e };
  }
  update.total = { increment: co2e };

  if (existing) {
    await prisma.carbonRecord.update({
      where: { id: existing.id },
      data: update,
    });
  } else {
    const newRecord: Record<string, unknown> = {
      userId,
      date: targetDate,
      transportation: 0,
      energy: 0,
      food: 0,
      shopping: 0,
      waste: 0,
      total: co2e,
    };
    if (validCategories.includes(category)) {
      newRecord[category] = co2e;
    }
    await prisma.carbonRecord.create({ data: newRecord as Parameters<typeof prisma.carbonRecord.create>[0]['data'] });
  }
}

export async function getActivityHistory(
  userId: string,
  options: { page?: number; limit?: number; category?: string; startDate?: Date; endDate?: Date }
) {
  const { page = 1, limit = 20, category, startDate, endDate } = options;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(category && { category }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {}),
  };

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activity.count({ where }),
  ]);

  return { activities, total, page, limit };
}

export async function getDailySummary(userId: string, date?: Date): Promise<DailyRecord | null> {
  const targetDate = date ?? new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const record = await prisma.carbonRecord.findFirst({
    where: { userId, date: { gte: dayStart, lte: dayEnd } },
  });

  return record;
}

export async function getWeeklySummary(userId: string): Promise<DailyRecord[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  return prisma.carbonRecord.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
}

export async function getMonthlySummary(
  userId: string,
  year?: number,
  month?: number
): Promise<FootprintSummary> {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  const cacheKey = CacheKeys.carbonSummary(userId, `${targetYear}-${targetMonth}`);
  const cached = await cacheGet<FootprintSummary>(cacheKey);
  if (cached) return cached;

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  const records = await prisma.carbonRecord.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
  });

  const totals = records.reduce(
    (acc, r) => ({
      transportation: acc.transportation + r.transportation,
      energy: acc.energy + r.energy,
      food: acc.food + r.food,
      shopping: acc.shopping + r.shopping,
      waste: acc.waste + r.waste,
      total: acc.total + r.total,
    }),
    { transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0, total: 0 }
  );

  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const averageDaily = totals.total / daysInMonth;
  const annualProjection = averageDaily * 365;
  const comparedToGlobal = annualProjection / GLOBAL_BENCHMARKS.global_average;
  const sustainabilityScore = Math.max(
    0,
    Math.min(100, 100 - (annualProjection / GLOBAL_BENCHMARKS.global_average) * 50)
  );

  // Get previous month for trend
  const prevStart = new Date(targetYear, targetMonth - 2, 1);
  const prevEnd = new Date(targetYear, targetMonth - 1, 0, 23, 59, 59);
  const prevRecords = await prisma.carbonRecord.findMany({
    where: { userId, date: { gte: prevStart, lte: prevEnd } },
  });
  const prevTotal = prevRecords.reduce((sum, r) => sum + r.total, 0);

  let trend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (prevTotal > 0) {
    const change = (totals.total - prevTotal) / prevTotal;
    if (change < -0.05) trend = 'improving';
    else if (change > 0.05) trend = 'worsening';
  }

  const summary: FootprintSummary = {
    totalCo2e: Number(totals.total.toFixed(2)),
    byCategory: {
      transportation: Number(totals.transportation.toFixed(2)),
      energy: Number(totals.energy.toFixed(2)),
      food: Number(totals.food.toFixed(2)),
      shopping: Number(totals.shopping.toFixed(2)),
      waste: Number(totals.waste.toFixed(2)),
    },
    averageDaily: Number(averageDaily.toFixed(2)),
    comparedToGlobal: Number(comparedToGlobal.toFixed(2)),
    sustainabilityScore: Number(sustainabilityScore.toFixed(1)),
    trend,
    percentileRank: Math.round(100 - comparedToGlobal * 50),
  };

  await cacheSet(cacheKey, summary, 600);
  return summary;
}

export async function getAnnualSummary(userId: string, year?: number) {
  const targetYear = year ?? new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

  const records = await prisma.carbonRecord.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });

  // Group by month
  const monthly: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) monthly[m] = 0;

  records.forEach((r) => {
    const month = r.date.getMonth() + 1;
    monthly[month] += r.total;
  });

  const total = records.reduce((sum, r) => sum + r.total, 0);

  return {
    year: targetYear,
    total: Number(total.toFixed(2)),
    monthly: Object.entries(monthly).map(([month, co2e]) => ({
      month: parseInt(month),
      co2e: Number(co2e.toFixed(2)),
    })),
  };
}

export async function getCarbonTrend(userId: string, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.carbonRecord.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
    select: { date: true, total: true, transportation: true, energy: true, food: true, shopping: true, waste: true },
  });
}

export async function deleteActivity(userId: string, activityId: string): Promise<void> {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId },
  });

  if (!activity) {
    throw new Error('Activity not found');
  }

  await prisma.activity.delete({ where: { id: activityId } });

  // Recompute daily record
  const dayStart = new Date(activity.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(activity.date);
  dayEnd.setHours(23, 59, 59, 999);

  const dayActivities = await prisma.activity.findMany({
    where: { userId, date: { gte: dayStart, lte: dayEnd } },
  });

  const totals = dayActivities.reduce(
    (acc, a) => {
      const cat = a.category as string;
      if (['transportation', 'energy', 'food', 'shopping', 'waste'].includes(cat)) {
        (acc as Record<string, number>)[cat] = ((acc as Record<string, number>)[cat] ?? 0) + a.co2e;
      }
      acc.total += a.co2e;
      return acc;
    },
    { transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0, total: 0 }
  );

  await prisma.carbonRecord.updateMany({
    where: { userId, date: { gte: dayStart, lte: dayEnd } },
    data: totals,
  });

  await cacheInvalidatePattern(`carbon:${userId}:*`);
}

export async function getEmissionCategories() {
  return {
    transportation: ['car_petrol', 'car_diesel', 'car_electric', 'car_hybrid', 'motorcycle', 'bus', 'train_local', 'train_long_distance', 'flight_domestic', 'flight_short_haul', 'flight_long_haul', 'bicycle', 'walking'],
    energy: ['electricity_grid', 'electricity_renewable', 'natural_gas', 'heating_oil', 'lpg', 'solar_panel'],
    food: ['beef', 'lamb', 'pork', 'chicken', 'fish_farmed', 'fish_wild', 'eggs', 'dairy_milk', 'dairy_cheese', 'vegetables', 'fruits', 'legumes', 'rice', 'coffee'],
    shopping: ['clothing_new', 'electronics_laptop', 'electronics_phone', 'electronics_tv', 'furniture', 'books', 'online_shopping', 'second_hand'],
    waste: ['landfill_general', 'recycling_paper', 'recycling_plastic', 'recycling_glass', 'recycling_metal', 'composting', 'water'],
  };
}
