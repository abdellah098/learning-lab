import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/errors';
import { logger } from '../config/logger';
import { AuthRequest, ApiResponse } from '../types';

export function errorHandler(
  error: Error,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  logger.error({
    error: error.message,
    stack: error.stack,
    traceId: req.traceId,
    url: req.url,
    method: req.method,
    user: req.user?._id,
  });

  let statusCode = 500;
  let code = 'INTERNAL';
  let message = 'Internal server error';
  let details: any[] | undefined;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = 'Invalid ID format';
  } else if (error.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      issue: err.message,
    }));
  } else if (error.message.includes('E11000')) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'Resource already exists';
    const field = error.message.match(/index: (.+)_/)?.[1] || 'field';
    details = [{ field, issue: 'Already exists' }];
  }

  const response: ApiResponse = {
    success: false,
    error: { code, message, details },
    traceId: req.traceId || 'unknown',
  };

  res.status(statusCode).json(response);
}

export function notFound(req: AuthRequest, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`,
    },
    traceId: req.traceId || 'unknown',
  };
  
  res.status(404).json(response);
}