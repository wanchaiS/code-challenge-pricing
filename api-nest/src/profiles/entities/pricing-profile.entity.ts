import {
  AdjustmentType,
  IncrementType,
  SelectionType,
} from '../../shared/types';

/**
 * Product adjustment within a pricing profile
 */
export interface ProductAdjustment {
  productId: string;
  adjustmentValue: number;
}

/**
 * Pricing Profile domain model
 */
export interface PricingProfile {
  _id: string;
  name: string;
  selectionType: SelectionType;
  adjustmentType: AdjustmentType;
  incrementType: IncrementType;
  basedOn: string | null; // another profile ID, null = global wholesale price
  adjustmentValueForAll: number | null; // used when selectionType is 'all'
  productAdjustments: ProductAdjustment[];
  createdAt: Date;
  updatedAt: Date;
  orgId: string;
}
