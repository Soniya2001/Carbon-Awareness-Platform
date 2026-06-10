import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function success<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

export function created<T>(res: Response, data: T, message = 'Created successfully'): Response {
  return success(res, data, message, 201);
}

export function error(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]>
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

export function badRequest(
  res: Response,
  message = 'Bad request',
  errors?: Record<string, string[]>
): Response {
  return error(res, message, 400, errors);
}

export function unauthorized(res: Response, message = 'Unauthorized'): Response {
  return error(res, message, 401);
}

export function forbidden(res: Response, message = 'Forbidden'): Response {
  return error(res, message, 403);
}

export function notFound(res: Response, message = 'Resource not found'): Response {
  return error(res, message, 404);
}

export function conflict(res: Response, message = 'Resource already exists'): Response {
  return error(res, message, 409);
}

export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
): Response {
  const totalPages = Math.ceil(total / limit);
  const meta: PaginationMeta = {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
  return res.status(200).json(response);
}
