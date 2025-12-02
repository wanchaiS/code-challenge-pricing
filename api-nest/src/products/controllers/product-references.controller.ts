import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreService } from 'src/shared/store.service';
import { ProductReferencesDto } from '../dto/product-references.dto';
import { ProductsService } from '../services/products.service';

@ApiTags('Product References')
@Controller('products-references')
export class ProductReferencesController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly store: StoreService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List references data',
    description:
      'Returns categories, subcategories, segments, brands, and styles.',
  })
  @ApiResponse({ status: 200, type: ProductReferencesDto })
  getReferences(): ProductReferencesDto {
    const user = this.store.getCurrentUser();
    return this.productsService.getReferences(user.orgId);
  }
}
