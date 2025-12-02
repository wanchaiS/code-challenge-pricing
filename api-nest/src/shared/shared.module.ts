import { Global, Module } from '@nestjs/common';
import { StoreService } from './store.service';

/**
 * Global module that provides shared services across the application
 * Marked as @Global() so StoreService is available everywhere without importing
 */
@Global()
@Module({
  providers: [StoreService],
  exports: [StoreService],
})
export class SharedModule {}
