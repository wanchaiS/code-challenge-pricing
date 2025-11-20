/**
 * Product domain model
 */
export interface Product {
  _id: string;
  brandId: string;
  categoryId: string;
  globalWholesalePrice: number;
  segmentId: string;
  styleId?: string;
  skuCode: string;
  subCategoryId: string;
  title: string;
  orgId: string;
}

/**
 * Product filter for search and filtering
 */
export interface ProductFilter {
  categoryId?: string;
  brandId?: string;
  search?: string;
  searchField?: "title" | "sku";
  segmentId?: string;
  subCategoryId?: string;
  styleId?: string;
}
