import type { AdjustmentType, IncrementType, SelectionType } from '#shared/types.js';

/**
 * Pricing Profile domain model
 */
export interface PricingProfile {
  _id: string;
  adjustmentType: AdjustmentType;
  basedOn: string | null; // another profile ID, if null means global wholesale price
  adjustmentValueForAll: number | null; // used when selectionType is 'all'
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

/**
 * Internal DTOs for profile repository operations
 * These are not exposed via API
 */
export interface CreatePricingProfileInput {
  name: string;
  selectionType: SelectionType;
}

export interface UpdatePricingProfileInput {
  adjustmentType?: AdjustmentType;
  basedOn?: string | null;
  adjustmentValueForAll?: number | null;
  incrementType?: IncrementType;
  name?: string;
  productAdjustments?: ProductAdjustment[];
  selectionType?: SelectionType;
}
