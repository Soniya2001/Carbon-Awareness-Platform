import { Router } from 'express';
import { body } from 'express-validator';
import * as simulationController from '../controllers/simulation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// GET /api/simulation/scenarios
router.get('/scenarios', simulationController.getScenarios);

// GET /api/simulation/compare
router.get('/compare', simulationController.compareScenarios);

// POST /api/simulation/run
router.post(
  '/run',
  [
    body('scenario').notEmpty().withMessage('Scenario is required'),
    body('years').optional().isInt({ min: 1, max: 10 }).withMessage('Years must be 1-10'),
  ],
  validateRequest,
  simulationController.runSimulation
);

// GET /api/simulation/history
router.get('/history', simulationController.getSimulationHistory);

// GET /api/simulation/:id
router.get('/:id', simulationController.getSimulationById);

export default router;
