import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsNumber,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product title',
    example: 'High Garden Pinot Noir 2021',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  title: string | null;

  @ApiPropertyOptional({
    description: 'SKU code',
    example: 'HGVPIN216',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  skuCode: string | null;

  @ApiPropertyOptional({
    description: 'Global wholesale price',
    example: 279.06,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  globalWholesalePrice: number;

  @ApiPropertyOptional({
    description: 'Brand ID',
    example: 'brand-1',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  brandId: string | null;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 'cat-1',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  categoryId: string | null;

  @ApiPropertyOptional({
    description: 'Subcategory ID',
    example: 'subcat-1',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  subCategoryId: string | null;

  @ApiPropertyOptional({
    description: 'Segment ID',
    example: 'seg-1',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  segmentId: string | null;

  @ApiPropertyOptional({
    description: 'Optional style ID',
    example: 'style-1',
    nullable: true,
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  styleId: string | null;
}
