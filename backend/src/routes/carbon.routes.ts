import { Router } from 'express';
import { body, query } from 'express-validator';
import * as carbonController from '../controllers/carbon.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// All carbon routes require authentication
router.use(authenticate);

// POST /api/carbon/record
router.post(
  '/record',
  [
    body('category').isIn(['transportation', 'energy', 'food', 'shopping', 'waste']).withMessage('Invalid category'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('date').optional().isISO8601().withMessage('Date must be valid ISO8601'),
  ],
  validateRequest,
  carbonController.logActivity
);

// GET /api/carbon/history
router.get('/history', carbonController.getHistory);

// GET /api/carbon/summary/daily
router.get('/summary/daily', carbonController.getDailySummary);

// GET /api/carbon/summary/weekly
router.get('/summary/weekly', carbonController.getWeeklySummary);

// GET /api/carbon/summary/monthly
router.get('/summary/monthly', carbonController.getMonthlySummary);

// GET /api/carbon/summary/annual
router.get('/summary/annual', carbonController.getAnnualSummary);

// GET /api/carbon/summary (default to monthly)
router.get('/summary', carbonController.getMonthlySummary);

// GET /api/carbon/trend
router.get('/trend', carbonController.getTrend);

// GET /api/carbon/categories
router.get('/categories', carbonController.getCategories);

// DELETE /api/carbon/record/:id
router.delete('/record/:id', carbonController.deleteActivity);

export default router;
