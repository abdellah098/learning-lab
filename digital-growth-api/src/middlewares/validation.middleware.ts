import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../common/errors';

export function validate(schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          issue: err.message,
        }));
        next(ApiError.validation('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}