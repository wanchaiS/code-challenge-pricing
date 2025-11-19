/**
 * Product domain model
 */
export interface Product {
  _id: string;
  brandId: string;
  categoryId: string;
  globalWholesalePrice: number;
  segmentId: string;
  skuCode: string;
  subCategoryId: string;
  title: string;
  orgId: string;
}

/**
 * Product filter for search and filtering
 */
export interface ProductFilter {
  brandId?: string;
  search?: string;
  segmentId?: string;
  subCategoryId?: string;
}
