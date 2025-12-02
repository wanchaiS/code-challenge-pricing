import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StoreService } from 'src/shared/store.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { SearchFilters } from '../dto/search-filters';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductsService } from '../services/products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly store: StoreService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'get all products',
  })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  listProducts(): ProductResponseDto[] {
    const user = this.store.getCurrentUser();
    return this.productsService.getProducts(user.orgId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search products',
    description:
      'Fuzzy search + filters for UI usage. Returns an empty array when no filters/search are provided.',
  })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  searchProducts(@Query() query: SearchFilters): ProductResponseDto[] {
    const user = this.store.getCurrentUser();
    return this.productsService.searchProducts(user.orgId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by ID',
    description: 'Retrieve a single product with populated references',
  })
  @ApiParam({ name: 'id', description: 'Product ID', example: 'prod-1' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProduct(@Param('id') id: string): ProductResponseDto {
    const user = this.store.getCurrentUser();
    return this.productsService.getProductById(id, user.orgId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a product',
    description: 'Create a new product within the current organization',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  createProduct(@Body() dto: CreateProductDto): ProductResponseDto {
    const user = this.store.getCurrentUser();
    return this.productsService.createProduct(user.orgId, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a product',
    description: 'Update an existing product owned by the current organization',
  })
  @ApiParam({ name: 'id', description: 'Product ID', example: 'prod-1' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): ProductResponseDto {
    const user = this.store.getCurrentUser();
    return this.productsService.updateProduct(id, user.orgId, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Remove a product owned by the current organization',
  })
  @ApiParam({ name: 'id', description: 'Product ID', example: 'prod-1' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id') id: string): void {
    const user = this.store.getCurrentUser();
    this.productsService.deleteProduct(id, user.orgId);
  }
}
