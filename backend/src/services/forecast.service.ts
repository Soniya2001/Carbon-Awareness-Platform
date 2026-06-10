import prisma from '../config/database';
import { cacheGetOrSet, CacheKeys } from '../utils/cache.utils';
import { logger } from '../config/logger';

export interface ForecastResult {
  period: string;
  predictedCo2e: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  basedOnDays: number;
  breakdown?: {
    transportation: number;
    energy: number;
    food: number;
    shopping: number;
    waste: number;
  };
}

export interface ForecastSeries {
  monthly: ForecastResult[];
  quarterly: ForecastResult;
  annual: ForecastResult;
  insight?: string;
}

async function getHistoricalRecords(userId: string, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.carbonRecord.findMany({
    where: { userId, date: { gte: startDate } },
    orderBy: { date: 'asc' },
  });
}

function calculateLinearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };

  const indices = values.map((_, i) => i);
  const meanX = indices.reduce((sum, x) => sum + x, 0) / n;
  const meanY = values.reduce((sum, y) => sum + y, 0) / n;

  const ssXX = indices.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
  const ssXY = indices.reduce((sum, x, i) => sum + (x - meanX) * (values[i] - meanY), 0);
  const ssYY = values.reduce((sum, y) => sum + (y - meanY) ** 2, 0);

  if (ssXX === 0) return { slope: 0, intercept: meanY, r2: 0 };

  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const r2 = ssXX > 0 && ssYY > 0 ? (ssXY ** 2) / (ssXX * ssYY) : 0;

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
}

function calculateSeasonalAdjustment(month: number): number {
  // Simple seasonal factor - energy higher in winter, lower in summer (northern hemisphere)
  const seasonalFactors = [1.15, 1.12, 1.05, 0.98, 0.92, 0.88, 0.87, 0.88, 0.93, 0.99, 1.07, 1.14];
  return seasonalFactors[month - 1] ?? 1.0;
}

export async function predictNextMonth(userId: string): Promise<ForecastResult> {
  return cacheGetOrSet(
    CacheKeys.forecast(userId, 'next-month'),
    async () => {
      const records = await getHistoricalRecords(userId, 90);

      if (records.length === 0) {
        return {
          period: 'next-month',
          predictedCo2e: 0,
          confidence: 0,
          trend: 'stable' as const,
          basedOnDays: 0,
        };
      }

      const dailyTotals = records.map((r) => r.total);
      const { slope, intercept, r2 } = calculateLinearRegression(dailyTotals);

      const nextDayIndex = dailyTotals.length;
      const daysInNextMonth = 30;
      let predictedTotal = 0;

      for (let i = 0; i < daysInNextMonth; i++) {
        const predicted = slope * (nextDayIndex + i) + intercept;
        predictedTotal += Math.max(0, predicted);
      }

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const seasonalFactor = calculateSeasonalAdjustment(nextMonth.getMonth() + 1);
      predictedTotal *= seasonalFactor;

      const avgCurrent = dailyTotals.reduce((sum, v) => sum + v, 0) / dailyTotals.length * 30;
      const trend: 'increasing' | 'decreasing' | 'stable' =
        slope > 0.02 ? 'increasing' : slope < -0.02 ? 'decreasing' : 'stable';

      const confidence = Math.min(0.95, Math.max(0.3, r2 * 0.8 + (records.length / 90) * 0.2));

      return {
        period: 'next-month',
        predictedCo2e: Number(predictedTotal.toFixed(2)),
        confidence: Number(confidence.toFixed(2)),
        trend,
        basedOnDays: records.length,
      };
    },
    3600
  );
}

export async function predict3Months(userId: string): Promise<ForecastResult[]> {
  const records = await getHistoricalRecords(userId, 90);

  if (records.length === 0) {
    return [];
  }

  const dailyTotals = records.map((r) => r.total);
  const { slope, intercept, r2 } = calculateLinearRegression(dailyTotals);

  const results: ForecastResult[] = [];
  const now = new Date();

  for (let m = 1; m <= 3; m++) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
    const baseIndex = dailyTotals.length + (m - 1) * 30;

    let monthTotal = 0;
    for (let d = 0; d < daysInMonth; d++) {
      const predicted = slope * (baseIndex + d) + intercept;
      monthTotal += Math.max(0, predicted);
    }

    const seasonal = calculateSeasonalAdjustment(targetMonth.getMonth() + 1);
    monthTotal *= seasonal;

    const trend: 'increasing' | 'decreasing' | 'stable' =
      slope > 0.02 ? 'increasing' : slope < -0.02 ? 'decreasing' : 'stable';

    const confidence = Math.min(0.9, Math.max(0.25, r2 * 0.7 - m * 0.05 + (records.length / 90) * 0.2));

    results.push({
      period: `${targetMonth.toLocaleString('default', { month: 'long' })} ${targetMonth.getFullYear()}`,
      predictedCo2e: Number(monthTotal.toFixed(2)),
      confidence: Number(confidence.toFixed(2)),
      trend,
      basedOnDays: records.length,
    });
  }

  return results;
}

export async function predict6Months(userId: string): Promise<ForecastResult[]> {
  const records = await getHistoricalRecords(userId, 180);

  if (records.length === 0) return [];

  const monthlyTotals = groupByMonth(records);
  const values = Object.values(monthlyTotals);
  const { slope, intercept, r2 } = calculateLinearRegression(values);

  const results: ForecastResult[] = [];
  const now = new Date();

  for (let m = 1; m <= 6; m++) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const predictedMonthly = Math.max(0, slope * (values.length + m) + intercept);
    const seasonal = calculateSeasonalAdjustment(targetMonth.getMonth() + 1);

    const trend: 'increasing' | 'decreasing' | 'stable' =
      slope > 5 ? 'increasing' : slope < -5 ? 'decreasing' : 'stable';

    const confidence = Math.min(0.85, Math.max(0.2, r2 * 0.65 - m * 0.04));

    results.push({
      period: `${targetMonth.toLocaleString('default', { month: 'long' })} ${targetMonth.getFullYear()}`,
      predictedCo2e: Number((predictedMonthly * seasonal).toFixed(2)),
      confidence: Number(confidence.toFixed(2)),
      trend,
      basedOnDays: records.length,
    });
  }

  return results;
}

export async function predictAnnual(userId: string): Promise<ForecastResult> {
  return cacheGetOrSet(
    CacheKeys.forecast(userId, 'annual'),
    async () => {
      const records = await getHistoricalRecords(userId, 365);

      if (records.length < 30) {
        return {
          period: 'annual',
          predictedCo2e: 0,
          confidence: 0,
          trend: 'stable' as const,
          basedOnDays: records.length,
        };
      }

      const monthlyTotals = groupByMonth(records);
      const values = Object.values(monthlyTotals);
      const { slope, r2 } = calculateLinearRegression(values);

      const avgMonthly = values.reduce((sum, v) => sum + v, 0) / values.length;
      const annualProjection = avgMonthly * 12 + slope * 12 * values.length;

      const trend: 'increasing' | 'decreasing' | 'stable' =
        slope > 5 ? 'increasing' : slope < -5 ? 'decreasing' : 'stable';

      const confidence = Math.min(0.9, Math.max(0.35, r2 * 0.7 + (records.length / 365) * 0.3));

      return {
        period: 'annual',
        predictedCo2e: Number(Math.max(0, annualProjection).toFixed(2)),
        confidence: Number(confidence.toFixed(2)),
        trend,
        basedOnDays: records.length,
      };
    },
    3600
  );
}

export async function calculateConfidenceScore(userId: string): Promise<number> {
  const records = await getHistoricalRecords(userId, 90);
  if (records.length === 0) return 0;
  const dailyTotals = records.map((r) => r.total);
  const { r2 } = calculateLinearRegression(dailyTotals);
  return Number(Math.min(0.95, r2 * 0.8 + (records.length / 90) * 0.2).toFixed(2));
}

function groupByMonth(
  records: Array<{ date: Date; total: number }>
): Record<string, number> {
  const grouped: Record<string, number> = {};
  records.forEach((r) => {
    const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
    grouped[key] = (grouped[key] ?? 0) + r.total;
  });
  return grouped;
}

export async function getForecastSeries(userId: string): Promise<ForecastSeries> {
  const [monthly3, annual] = await Promise.all([
    predict3Months(userId),
    predictAnnual(userId),
  ]);

  const quarterlyTotal = monthly3.reduce((sum, m) => sum + m.predictedCo2e, 0);
  const quarterly: ForecastResult = {
    period: 'next-quarter',
    predictedCo2e: Number(quarterlyTotal.toFixed(2)),
    confidence: monthly3[0]?.confidence ?? 0,
    trend: monthly3[0]?.trend ?? 'stable',
    basedOnDays: monthly3[0]?.basedOnDays ?? 0,
  };

  return {
    monthly: monthly3,
    quarterly,
    annual,
  };
}
