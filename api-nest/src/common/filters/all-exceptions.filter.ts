import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../exceptions/api.exception';

/**
 * Global exception filter that catches all errors
 * Transforms errors into consistent JSON responses
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle NestJS HttpException (including BadRequestException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response.status(status).json(exceptionResponse);
      return;
    }

    // Handle custom ApiException
    if (exception instanceof ApiException) {
      response.status(exception.statusCode).json({
        code: exception.code,
        message: exception.message,
      });
      return;
    }

    // Unknown errors
    console.error('Unexpected error:', exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }
}
