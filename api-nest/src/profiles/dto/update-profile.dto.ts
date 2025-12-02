import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNumber,
  IsString,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  AdjustmentType,
  IncrementType,
  SelectionType,
} from '../../shared/types';

/**
 * Product adjustment for individual product pricing
 */
export class ProductAdjustmentDto {
  @ApiProperty({
    example: 'prod-1',
    description: 'Product ID to apply adjustment to',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    example: 10.5,
    minimum: 0,
    description:
      'Adjustment value (meaning depends on adjustmentType and incrementType)',
  })
  @IsNumber()
  @Min(0)
  adjustmentValue: number;
}

/**
 * DTO for updating a pricing profile
 * Note: Selection type determines which fields are required
 * - selectionType='all': requires adjustmentValueForAll, productAdjustments should be empty
 * - selectionType='one': requires exactly 1 productAdjustment
 * - selectionType='multiple': requires 1+ productAdjustments
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Updated Premium Pricing',
    description: 'Profile name (1-120 characters)',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Length(1, 120)
  name: string;

  @ApiProperty({
    enum: SelectionType,
    description: 'Selection type: all, multiple, or one',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsEnum(SelectionType)
  selectionType: SelectionType;

  @ApiProperty({
    enum: AdjustmentType,
    description:
      'Adjustment type: fixed (currency amount) or dynamic (percentage)',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @ApiProperty({
    enum: IncrementType,
    description: 'Increment type: increase or decrease',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsEnum(IncrementType)
  incrementType: IncrementType;

  @ApiPropertyOptional({
    example: 'profile-id-123',
    nullable: true,
    description:
      'Base profile ID to calculate prices from, null = use global wholesale price',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  basedOn: string | null;

  @ApiPropertyOptional({
    example: 15,
    nullable: true,
    minimum: 0,
    description:
      'Adjustment value for all products (only used when selectionType=all)',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  adjustmentValueForAll: number | null;

  @ApiPropertyOptional({
    type: [ProductAdjustmentDto],
    description:
      'Per-product adjustments (only used when selectionType=one or multiple)',
  })
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAdjustmentDto)
  productAdjustments: ProductAdjustmentDto[];
}
