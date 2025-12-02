import { ApiProperty } from '@nestjs/swagger';

class ReferenceDto {
  @ApiProperty({ example: 'brand-1' })
  _id: string;

  @ApiProperty({ example: 'High Garden' })
  name: string;
}

class SubCategoryReferenceDto extends ReferenceDto {
  @ApiProperty({ example: 'cat-1' })
  categoryId: string;
}

class StyleReferenceDto extends ReferenceDto {
  @ApiProperty({ example: 'subcat-1' })
  subCategoryId: string;
}

export class ProductReferencesDto {
  @ApiProperty({ type: [ReferenceDto] })
  categories: ReferenceDto[];

  @ApiProperty({ type: [SubCategoryReferenceDto] })
  subCategories: SubCategoryReferenceDto[];

  @ApiProperty({ type: [ReferenceDto] })
  segments: ReferenceDto[];

  @ApiProperty({ type: [ReferenceDto] })
  brands: ReferenceDto[];

  @ApiProperty({ type: [StyleReferenceDto] })
  styles: StyleReferenceDto[];
}
