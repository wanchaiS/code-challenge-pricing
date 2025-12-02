import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreService } from './shared/store.service';

@Controller()
export class AppController {
  constructor(private readonly store: StoreService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Simple health check endpoint to verify API is running',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'FOBOH Pricing API is running' },
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      message: 'FOBOH Pricing API is running',
    };
  }

  @Post('api/test/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiTags('Testing')
  @ApiOperation({
    summary: 'Reset database',
    description:
      'Reset the in-memory database to initial seed data. For development/testing only.',
  })
  @ApiResponse({
    status: 204,
    description: 'Database reset successfully',
  })
  resetDatabase(): void {
    this.store.resetDb();
  }
}
