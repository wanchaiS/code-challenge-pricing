import { HttpException } from '@nestjs/common';

/**
 * Custom exception class for API errors
 * Extends NestJS HttpException to integrate with exception filters
 */
export class ApiException extends HttpException {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'API_ERROR',
  ) {
    super({ code, message }, statusCode);
  }
}

/**
 * Helper to create 404 Not Found errors
 */
export function notFound(resource: string): ApiException {
  return new ApiException(404, `${resource} not found`, 'NOT_FOUND');
}

/**
 * Helper to create 400 Bad Request errors
 */
export function badRequest(message: string): ApiException {
  return new ApiException(400, message, 'BAD_REQUEST');
}

/**
 * Helper to create 409 Conflict errors
 */
export function conflict(message: string): ApiException {
  return new ApiException(409, message, 'CONFLICT');
}
