import { AdjustmentType, IncrementType, SelectionType } from './types';

/**
 * Reference data models for products
 */

export interface Brand {
  _id: string;
  name: string;
  orgId: string;
}

export interface Category {
  _id: string;
  name: string;
  orgId: string;
}

export interface SubCategory {
  _id: string;
  categoryId: string;
  name: string;
  orgId: string;
}

export interface Segment {
  _id: string;
  name: string;
  orgId: string;
}

export interface Style {
  _id: string;
  name: string;
  subCategoryId: string;
  orgId: string;
}

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
 * Pricing Profile domain model
 */
export interface PricingProfile {
  _id: string;
  adjustmentType: AdjustmentType;
  basedOn: string | null;
  adjustmentValueForAll: number | null;
  incrementType: IncrementType;
  name: string;
  selectionType: SelectionType;
  productAdjustments: ProductAdjustment[];
  createdAt: Date;
  updatedAt: Date;
  orgId: string;
}

export interface ProductAdjustment {
  adjustmentValue: number;
  productId: string;
}
