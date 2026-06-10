import { Router } from 'express';
import * as forecastController from '../controllers/forecast.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// GET /api/forecast/monthly
router.get('/monthly', forecastController.getMonthlyForecast);

// GET /api/forecast/quarterly
router.get('/quarterly', forecastController.getQuarterlyForecast);

// GET /api/forecast/six-months
router.get('/six-months', forecastController.getSixMonthForecast);

// GET /api/forecast/annual
router.get('/annual', forecastController.getAnnualForecast);

// GET /api/forecast (full series)
router.get('/', forecastController.getFullForecast);

export default router;
