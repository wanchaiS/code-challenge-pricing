import type { RequestHandler } from "express";

/**
 * Wraps async controllers so rejected promises flow into Express error middleware.
 */
export function asyncHandler<Params = unknown, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown>(
  handler: RequestHandler<Params, ResBody, ReqBody, ReqQuery>,
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
