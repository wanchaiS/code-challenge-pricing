import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

enum ProductFilterSearchField {
  TITLE = 'title',
  SKU_CODE = 'skuCode',
}

/**
 * Product filter for search and filtering
 */
export class SearchFilters {
  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: 'category-1',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by brand ID',
    example: 'brand-1',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    description: 'Fuzzy search by title or SKU code',
    example: 'koyama',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiPropertyOptional({
    description:
      'Restrict fuzzy search to a specific field. Omit to search both title and skuCode.',
    enum: ProductFilterSearchField,
  })
  @IsOptional()
  @IsEnum(ProductFilterSearchField)
  searchField?: ProductFilterSearchField;

  @ApiPropertyOptional({
    description: 'Filter by segment ID',
    example: 'segment-1',
  })
  @IsOptional()
  @IsString()
  segmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by subcategory ID',
    example: 'subcategory-1',
  })
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by style ID',
    example: 'style-1',
  })
  @IsOptional()
  @IsString()
  styleId?: string;
}
