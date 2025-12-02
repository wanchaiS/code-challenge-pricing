import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length } from 'class-validator';
import { SelectionType } from '../../shared/types';

/**
 * DTO for creating a new pricing profile
 */
export class CreateProfileDto {
  @ApiProperty({
    example: 'Premium Pricing',
    description: 'Profile name (1-120 characters, unique per organization)',
    minLength: 1,
    maxLength: 120,
  })
  @IsString()
  @Length(1, 120)
  name: string;

  @ApiProperty({
    enum: SelectionType,
    example: SelectionType.MULTIPLE,
    description:
      'Selection type: all (apply to all products), multiple (apply to specific products), or one (apply to single product)',
  })
  @IsEnum(SelectionType)
  selectionType: SelectionType;
}
