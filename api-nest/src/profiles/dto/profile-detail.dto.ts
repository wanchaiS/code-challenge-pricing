import { ApiProperty } from '@nestjs/swagger';
import { ProfileResponseDto } from './profile-response.dto';

/**
 * Profile detail item with calculated pricing
 */
export class ProfileDetailItemDto {
  @ApiProperty({ description: 'Product information' })
  product: any; // Will be ProductDto from products module

  @ApiProperty({
    description: 'Starting price (from base profile or global wholesale price)',
    example: 100.0,
  })
  basedOnPrice: number;

  @ApiProperty({
    description: 'Adjustment amount applied to this product',
    example: 10.5,
  })
  adjustmentValue: number;

  @ApiProperty({
    description: 'Final calculated price after adjustment',
    example: 110.5,
  })
  newPrice: number;
}

/**
 * Profile detail with all calculated prices
 */
export class ProfileDetailDto {
  @ApiProperty({ description: 'Profile information' })
  profile: ProfileResponseDto;

  @ApiProperty({
    type: [ProfileDetailItemDto],
    description: 'List of products with calculated prices',
  })
  items: ProfileDetailItemDto[];
}
