import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Generic validation middleware for request validation using Zod schemas
 */
export function validate(schema: {
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate query parameters
      if (schema.query) {
        const parsedQuery = await schema.query.parseAsync(req.query);
        req.query = parsedQuery as typeof req.query;
      }

      // Validate route parameters
      if (schema.params) {
        const parsedParams = await schema.params.parseAsync(req.params);
        req.params = parsedParams as typeof req.params;
      }

      // Validate request body
      if (schema.body) {
        const parsedBody = await schema.body.parseAsync(req.body);
        req.body = parsedBody as typeof req.body;
      }

      next();
    } catch (error) {
      // ZodError will be caught by the global error handler
      next(error);
    }
  };
}
