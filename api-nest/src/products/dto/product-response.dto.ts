import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReferenceDto {
  @ApiProperty({ example: 'brand-1' })
  _id: string;

  @ApiProperty({ example: 'High Garden' })
  name: string;
}

class SubCategoryDto extends ReferenceDto {
  @ApiProperty({ example: 'cat-1' })
  categoryId: string;
}

class StyleDto extends ReferenceDto {
  @ApiProperty({ example: 'subcat-1' })
  subCategoryId: string;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'prod-1',
  })
  _id: string;

  @ApiProperty({
    description: 'Product title',
    example: 'High Garden Pinot Noir 2021',
  })
  title: string;

  @ApiProperty({ description: 'SKU code', example: 'HGVPIN216' })
  skuCode: string;

  @ApiProperty({ description: 'Global wholesale price', example: 279.06 })
  globalWholesalePrice: number;

  @ApiPropertyOptional({
    description: 'Brand information',
    type: ReferenceDto,
    nullable: true,
  })
  brand: ReferenceDto | null;

  @ApiPropertyOptional({
    description: 'Category information',
    type: ReferenceDto,
    nullable: true,
  })
  category: ReferenceDto | null;

  @ApiPropertyOptional({
    description: 'Subcategory information',
    type: SubCategoryDto,
    nullable: true,
  })
  subCategory: SubCategoryDto | null;

  @ApiPropertyOptional({
    description: 'Segment information',
    type: ReferenceDto,
    nullable: true,
  })
  segment: ReferenceDto | null;

  @ApiPropertyOptional({
    description: 'Style information',
    type: StyleDto,
    nullable: true,
  })
  style: StyleDto | null;
}
