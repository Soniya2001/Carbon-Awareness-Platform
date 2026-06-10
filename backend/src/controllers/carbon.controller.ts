import { Request, Response, NextFunction } from 'express';
import * as carbonService from '../services/carbon.service';
import * as gamificationService from '../services/gamification.service';
import { success, created, badRequest, notFound, paginated } from '../utils/response.utils';

export async function logActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { category, subcategory, value, unit, date } = req.body;

    const activity = await carbonService.logActivity(userId, {
      category,
      subcategory,
      value: Number(value),
      unit,
      date: date ? new Date(date as string) : undefined,
    });

    // Award points for logging
    await gamificationService.addPoints(userId, 10, 'Activity logged');

    // Check for badges
    const newBadges = await gamificationService.checkAndAwardBadges(userId);

    created(res, { activity, newBadges }, 'Activity logged successfully');
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '20', category, startDate, endDate } = req.query;

    const result = await carbonService.getActivityHistory(userId, {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
      category: category as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    paginated(res, result.activities, result.total, result.page, result.limit);
  } catch (err) {
    next(err);
  }
}

export async function getDailySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { date } = req.query;
    const record = await carbonService.getDailySummary(userId, date ? new Date(date as string) : undefined);
    success(res, record ?? { total: 0, transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0 });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const records = await carbonService.getWeeklySummary(userId);
    success(res, records);
  } catch (err) {
    next(err);
  }
}

export async function getMonthlySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { year, month } = req.query;
    const summary = await carbonService.getMonthlySummary(
      userId,
      year ? parseInt(year as string) : undefined,
      month ? parseInt(month as string) : undefined
    );
    success(res, summary);
  } catch (err) {
    next(err);
  }
}

export async function getAnnualSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { year } = req.query;
    const summary = await carbonService.getAnnualSummary(userId, year ? parseInt(year as string) : undefined);
    success(res, summary);
  } catch (err) {
    next(err);
  }
}

export async function getTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { days = '30' } = req.query;
    const trend = await carbonService.getCarbonTrend(userId, parseInt(days as string));
    success(res, trend);
  } catch (err) {
    next(err);
  }
}

export async function deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await carbonService.deleteActivity(userId, id);
    success(res, null, 'Activity deleted');
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      notFound(res);
    } else {
      next(err);
    }
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await carbonService.getEmissionCategories();
    success(res, categories);
  } catch (err) {
    next(err);
  }
}
