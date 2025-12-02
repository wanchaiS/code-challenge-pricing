import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductReferencesController } from './controllers/product-references.controller';
import { ProductsService } from './services/products.service';
import { ProductRepository } from './repositories/product.repository';
import { ReferenceRepository } from './repositories/reference.repository';

@Module({
  controllers: [ProductsController, ProductReferencesController],
  providers: [ProductsService, ProductRepository, ReferenceRepository],
  exports: [ProductsService, ProductRepository, ReferenceRepository],
})
export class ProductsModule {}
