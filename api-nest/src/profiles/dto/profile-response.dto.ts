import { ApiProperty } from '@nestjs/swagger';
import {
  AdjustmentType,
  IncrementType,
  SelectionType,
} from '../../shared/types';

/**
 * Product adjustment response
 */
export class ProductAdjustmentResponseDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  adjustmentValue: number;
}

/**
 * Pricing profile response DTO
 */
export class ProfileResponseDto {
  @ApiProperty({ example: 'profile-1' })
  _id: string;

  @ApiProperty({ example: 'Premium Pricing' })
  name: string;

  @ApiProperty({ enum: SelectionType })
  selectionType: SelectionType;

  @ApiProperty({ enum: AdjustmentType })
  adjustmentType: AdjustmentType;

  @ApiProperty({ enum: IncrementType })
  incrementType: IncrementType;

  @ApiProperty({ nullable: true, example: 'profile-id-123' })
  basedOn: string | null;

  @ApiProperty({ nullable: true, example: 15 })
  adjustmentValueForAll: number | null;

  @ApiProperty({ type: [ProductAdjustmentResponseDto] })
  productAdjustments: ProductAdjustmentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: 'org-1' })
  orgId: string;
}
