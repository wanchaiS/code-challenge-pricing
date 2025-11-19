import type { AdjustmentType, IncrementType } from '#shared/types.js';

/**
 * Pricing Profile domain model
 */
export interface PricingProfile {
  _id: string;
  adjustmentType: AdjustmentType;
  basedOn: string | null; // another profile ID, if null means global wholesale price
  incrementType: IncrementType;
  name: string;
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
export interface CreatePricingProfileDto {
  name: string;
}

export interface UpdatePricingProfileDto {
  adjustmentType?: AdjustmentType;
  basedOn?: string;
  incrementType?: IncrementType;
  name?: string;
  productAdjustments?: ProductAdjustment[];
}
