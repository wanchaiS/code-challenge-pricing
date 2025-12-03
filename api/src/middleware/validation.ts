import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

/**
 * Generic validation middleware for request validation using Zod schemas
 */
export function validate(schema: {
  query?: z.ZodType;
  params?: z.ZodType;
  body?: z.ZodType;
}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate query parameters
      if (schema.query) {
        await schema.query.parseAsync(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        await schema.params.parseAsync(req.params);
      }

      // Validate request body
      if (schema.body) {
        await schema.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      // ZodError will be caught by the global error handler
      next(error);
    }
  };
}
