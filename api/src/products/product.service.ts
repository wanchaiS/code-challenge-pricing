import { profileRepository } from '../profiles/repositories/profile.repository.js';
import type { Product } from './models/product.model.js';
import { AdjustmentType, IncrementType } from '../shared/types.js';

/**
 * Calculate the new price based on adjustment rules
 *
 * Formulas:
 * - Fixed Increase: basedOnPrice + adjustmentValue
 * - Fixed Decrease: basedOnPrice - adjustmentValue
 * - Dynamic Increase: basedOnPrice + (basedOnPrice * adjustmentValue / 100)
 * - Dynamic Decrease: basedOnPrice - (basedOnPrice * adjustmentValue / 100)
 *
 * Note: Ensures price never goes negative
 */
export const calculateNewPrice = (
  basedOnPrice: number,
  adjustmentType: AdjustmentType,
  adjustmentValue: number,
  incrementType: IncrementType,
): number => {
  let newPrice: number

  if (adjustmentType === AdjustmentType.FIXED) {
    // Fixed adjustment
    if (incrementType === IncrementType.INCREASE) {
      newPrice = basedOnPrice + adjustmentValue
    } else {
      newPrice = basedOnPrice - adjustmentValue
    }
  } else {
    // Dynamic (percentage) adjustment
    const percentageAmount = (basedOnPrice * adjustmentValue) / 100

    if (incrementType === IncrementType.INCREASE) {
      newPrice = basedOnPrice + percentageAmount
    } else {
      newPrice = basedOnPrice - percentageAmount
    }
  }

  // Round to 2 decimal places, ensure price never goes negative
  return Math.max(0, Number(newPrice.toFixed(2)))
}

/**
 * Get the "based on" price for a product
 * This can be either:
 * - Global wholesale price (if basedOn === null)
 * - Price from another pricing profile (if basedOn is a profile ID)
 */
export const getBasedOnPrice = (
  product: Product,
  basedOn: string | null,
): number => {
  // If based on global, use the global wholesale price
  if (basedOn === null) {
    return product.globalWholesalePrice
  }

  // Otherwise, look up the pricing profile
  const baseProfile = profileRepository.findById(basedOn)
  if (!baseProfile) {
    // If profile not found, default to global
    return product.globalWholesalePrice
  }

  // Check if the product is in the base profile
  const productAdjustmentInBase = baseProfile.productAdjustments.find((p => p.productId === product._id));
  if (!productAdjustmentInBase) {
    // If product not in base profile, use global price
    return product.globalWholesalePrice
  }

  // Recursively calculate the price from the base profile
  const baseBasedOnPrice = getBasedOnPrice(product, baseProfile.basedOn)
  return calculateNewPrice(
    baseBasedOnPrice,
    baseProfile.adjustmentType,
    productAdjustmentInBase.adjustmentValue,
    baseProfile.incrementType,
  )
}