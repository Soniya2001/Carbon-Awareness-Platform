import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap: Record<string, string[]> = {};
    errors.array().forEach((err) => {
      if (err.type === 'field') {
        const field = err.path;
        if (!errorMap[field]) {
          errorMap[field] = [];
        }
        errorMap[field].push(err.msg);
      }
    });

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMap,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
}
