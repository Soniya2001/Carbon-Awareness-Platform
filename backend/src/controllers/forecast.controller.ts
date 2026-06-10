import { Request, Response, NextFunction } from 'express';
import * as forecastService from '../services/forecast.service';
import * as gamificationService from '../services/gamification.service';
import { success } from '../utils/response.utils';
import { BADGES } from '../services/gamification.service';

export async function getMonthlyForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const forecast = await forecastService.predictNextMonth(userId);
    success(res, forecast);
  } catch (err) {
    next(err);
  }
}

export async function getQuarterlyForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const forecasts = await forecastService.predict3Months(userId);
    success(res, forecasts);
  } catch (err) {
    next(err);
  }
}

export async function getAnnualForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const forecast = await forecastService.predictAnnual(userId);

    // Award badge for checking forecast
    await gamificationService.addPoints(userId, 5, 'Checked forecast');
    await gamificationService.awardBadge(userId, BADGES.FORECASTER.id);

    success(res, forecast);
  } catch (err) {
    next(err);
  }
}

export async function getFullForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const series = await forecastService.getForecastSeries(userId);
    success(res, series);
  } catch (err) {
    next(err);
  }
}

export async function getSixMonthForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const forecasts = await forecastService.predict6Months(userId);
    success(res, forecasts);
  } catch (err) {
    next(err);
  }
}
