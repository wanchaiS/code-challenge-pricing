import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'High Garden Pinot Noir 2021',
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    description: 'SKU code',
    example: 'HGVPIN216',
  })
  @IsString()
  @MinLength(1)
  skuCode: string;

  @ApiProperty({
    description: 'Global wholesale price',
    example: 279.06,
  })
  @IsNumber()
  @Min(0)
  globalWholesalePrice: number;

  @ApiProperty({
    description: 'Brand ID',
    example: 'brand-1',
  })
  @IsString()
  @MinLength(1)
  brandId: string;

  @ApiProperty({
    description: 'Category ID',
    example: 'cat-1',
  })
  @IsString()
  @MinLength(1)
  categoryId: string;

  @ApiProperty({
    description: 'Subcategory ID',
    example: 'subcat-1',
  })
  @IsString()
  @MinLength(1)
  subCategoryId: string;

  @ApiProperty({
    description: 'Segment ID',
    example: 'seg-1',
  })
  @IsString()
  @MinLength(1)
  segmentId: string;

  @ApiProperty({
    description: 'Optional style ID',
    example: 'style-1',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  styleId?: string | null;
}
