import { Request, Response, NextFunction } from 'express';
import * as simulationService from '../services/simulation.service';
import * as gamificationService from '../services/gamification.service';
import { success, badRequest, notFound } from '../utils/response.utils';
import { BADGES } from '../services/gamification.service';

export async function runSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { scenario, years = 1 } = req.body;

    if (!scenario) {
      badRequest(res, 'Scenario is required');
      return;
    }

    const result = await simulationService.runSimulation(userId, scenario, Number(years));

    // Award points and badge for first simulation
    await gamificationService.addPoints(userId, 20, 'Carbon Twin simulation');
    await gamificationService.awardBadge(userId, BADGES.TWIN_EXPLORER.id);

    success(res, result, 'Simulation completed');
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unknown scenario')) {
      badRequest(res, err.message);
    } else {
      next(err);
    }
  }
}

export async function getSimulationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const history = await simulationService.getSimulationHistory(userId);
    success(res, history);
  } catch (err) {
    next(err);
  }
}

export async function getSimulationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const simulation = await simulationService.getSimulationById(userId, id);
    success(res, simulation);
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      notFound(res, 'Simulation not found');
    } else {
      next(err);
    }
  }
}

export async function compareScenarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const comparisons = await simulationService.compareScenarios(userId);
    success(res, comparisons);
  } catch (err) {
    next(err);
  }
}

export async function getScenarios(_req: Request, res: Response): Promise<void> {
  const scenarios = Object.entries(simulationService.SCENARIOS).map(([key, s]) => ({
    key,
    name: s.name,
    description: s.description,
    changeCount: s.changes.length,
  }));
  success(res, scenarios);
}
