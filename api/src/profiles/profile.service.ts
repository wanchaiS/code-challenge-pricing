import type { Product } from "#products/models/product.model.js";
import type { ProductDto } from "#products/schemas/product.schema.js";
import type { z } from "zod";
import { ApiError, notFound } from "../middleware/errorHandler.js";
import {
  buildProductReferenceLookups,
  mapProductDto
} from "../products/product.mapper.js";
import { productRepository } from "../products/repositories/product.repository.js";
import { getCurrentUser } from "../shared/store.js";
import { AdjustmentType, IncrementType, SelectionType } from "../shared/types.js";
import type {
  PricingProfile,
  ProductAdjustment,
  UpdatePricingProfileInput,
} from "./models/profile.model.js";
import { profileRepository } from "./repositories/profile.repository.js";
import { updateProfileSchema } from "./schemas/profile.schema.js";

const INVALID_PROFILE_CODE = "INVALID_PROFILE";

type ProfileUpdateInput = z.infer<typeof updateProfileSchema>;

export interface ProfileDetailItem {
  product: ProductDto;
  basedOnPrice: number;
  adjustmentValue: number;
  newPrice: number;
}

export interface PricingProfileDetail {
  profile: PricingProfile;
  items: ProfileDetailItem[];
}

export function listPricingProfiles(): PricingProfile[] {
  const user = getCurrentUser();
  return profileRepository.findByOrgId(user.orgId);
}

export function getPricingProfileDetail(id: string): PricingProfileDetail {
  const profile = getPricingProfile(id);
  const user = getCurrentUser();

  const items = buildProfileItems(profile, user.orgId);
  return { profile, items };
}

export function createPricingProfile(name: string): PricingProfile {
  const user = getCurrentUser();
  return profileRepository.create(user.orgId, { name });
}


export function updatePricingProfile(
  id: string,
  payload: ProfileUpdateInput,
): PricingProfile {
  const user = getCurrentUser();
  getPricingProfile(id);

  const normalizedAdjustments = normalizeAdjustments(
    payload.selectionType,
    payload.productAdjustments,
    user.orgId,
  );

  const basedOnValue = payload.basedOn ?? null;
  ensureBasedOnReference(user.orgId, basedOnValue, id);

  let adjustmentValueForAll: number | null = null;
  if (payload.selectionType === SelectionType.ALL) {
    adjustmentValueForAll = payload.adjustmentValueForAll;
    if (adjustmentValueForAll === null || adjustmentValueForAll === undefined) {
      throw new ApiError(400, "All-products profile requires an adjustment value", INVALID_PROFILE_CODE);
    }
  }

  const updateDto: UpdatePricingProfileInput = {
    ...payload,
    basedOn: basedOnValue,
    productAdjustments: normalizedAdjustments,
    adjustmentValueForAll,
  };

  // make sure to clear irrelevant fields
  if (payload.selectionType === SelectionType.ALL) {
    updateDto.productAdjustments = [];
  } else {
    updateDto.adjustmentValueForAll = null;
  }

  const updated = profileRepository.update(id, updateDto);

  if (!updated) {
    throw notFound("Pricing profile");
  }

  return updated;
}

export function deletePricingProfile(id: string): void {
  getPricingProfile(id);
  const deleted = profileRepository.delete(id);
  if (!deleted) {
    throw notFound("Pricing profile");
  }
}

export function previewProfilePricing(
  id: string,
  payload: ProfileUpdateInput,
): ProfileDetailItem[] {
  const user = getCurrentUser();

  const normalizedAdjustments = normalizeAdjustments(
    payload.selectionType,
    payload.productAdjustments,
    user.orgId,
  );

  const basedOnValue = payload.basedOn ?? null;
  ensureBasedOnReference(user.orgId, basedOnValue, id);

  let adjustmentValueForAll: number | null = null;
  if (payload.selectionType === SelectionType.ALL) {
    adjustmentValueForAll = payload.adjustmentValueForAll;
    if (adjustmentValueForAll === null || adjustmentValueForAll === undefined) {
      throw new ApiError(400, "All-products profile requires an adjustment value", INVALID_PROFILE_CODE);
    }
  }

  // Construct a temporary profile object for preview purposes
  const previewProfile: PricingProfile = {
    _id: id,
    adjustmentType: payload.adjustmentType,
    adjustmentValueForAll: adjustmentValueForAll ?? null,
    basedOn: basedOnValue,
    incrementType: payload.incrementType,
    name: payload.name ?? "Preview",
    selectionType: payload.selectionType,
    productAdjustments: payload.selectionType === SelectionType.ALL ? [] : normalizedAdjustments,
    createdAt: new Date(),
    updatedAt: new Date(),
    orgId: user.orgId,
  };

  return buildProfileItems(previewProfile, user.orgId);
}

// ================ Helper functions ================ //

function getPricingProfile(id: string): PricingProfile {
  const user = getCurrentUser();
  const profile = profileRepository.findById(id);
  return ensureProfileAvailable(profile, user.orgId);
}

function normalizeAdjustments(
  targetSelection: SelectionType,
  adjustments: ProductAdjustment[] | undefined,
  orgId: string,
): ProductAdjustment[] {
  if (targetSelection === SelectionType.ALL) {
    return [];
  }

  if (!adjustments || adjustments.length === 0) {
    throw new ApiError(400, "Product adjustments are required", INVALID_PROFILE_CODE);
  }

  ensureProductsExist(orgId, adjustments);

  if (targetSelection === SelectionType.ONE && adjustments.length !== 1) {
    throw new ApiError(400, "Single product profiles must include exactly one adjustment", INVALID_PROFILE_CODE);
  }

  return adjustments;
}

function ensureProfileAvailable(profile: PricingProfile | undefined, orgId: string): PricingProfile {
  if (!profile || profile.orgId !== orgId) {
    throw notFound("Pricing profile");
  }
  return profile;
}

function ensureBasedOnReference(orgId: string, basedOn: string | null, currentId?: string): void {
  if (!basedOn) {
    return;
  }

  if (currentId && basedOn === currentId) {
    throw new ApiError(400, "Profile cannot be based on itself", INVALID_PROFILE_CODE);
  }

  const baseProfile = profileRepository.findById(basedOn);
  if (!baseProfile || baseProfile.orgId !== orgId) {
    throw new ApiError(400, "Base profile not found for this organization", INVALID_PROFILE_CODE);
  }
}

function ensureProductsExist(orgId: string, adjustments: ProductAdjustment[]): void {
  const ids = adjustments.map((adj) => adj.productId);
  const found = productRepository.findByIds(ids).filter((product) => product.orgId === orgId);

  if (found.length !== ids.length) {
    throw new ApiError(400, "One or more products do not exist for this organization", INVALID_PROFILE_CODE);
  }
}

function selectProductsForProfile(profile: PricingProfile, orgId: string): Product[] {
  if (profile.selectionType === SelectionType.ALL) {
    return productRepository.findByOrgId(orgId);
  }

  const ids = profile.productAdjustments.map((adj) => adj.productId);
  if (ids.length === 0) {
    return [];
  }

  return productRepository.findByIds(ids).filter((product) => product.orgId === orgId);
}

function buildProfileItems(profile: PricingProfile, orgId: string): ProfileDetailItem[] {
  const products = selectProductsForProfile(profile, orgId);
  const lookups = buildProductReferenceLookups(orgId);
  const adjustmentMap = new Map(profile.productAdjustments.map((adj) => [adj.productId, adj.adjustmentValue]));

  return products.map((product) => {
    const basedOnPrice = getBasedOnPrice(product, profile.basedOn);
    const adjustmentValue =
      profile.selectionType === SelectionType.ALL
        ? profile.adjustmentValueForAll ?? 0
        : adjustmentMap.get(product._id) ?? 0;
    const newPrice = calculateNewPrice(
      basedOnPrice,
      profile.adjustmentType,
      adjustmentValue,
      profile.incrementType,
    );

    return {
      product: mapProductDto(product, lookups),
      basedOnPrice,
      adjustmentValue,
      newPrice,
    };
  });
}

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
export function calculateNewPrice(
  basedOnPrice: number,
  adjustmentType: AdjustmentType,
  adjustmentValue: number,
  incrementType: IncrementType,
): number {
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
export function getBasedOnPrice(
  product: Product,
  basedOn: string | null,
): number {
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
  const baseBasedOnPrice = getBasedOnPrice(product, baseProfile.basedOn)

  if (baseProfile.selectionType === SelectionType.ALL) {
    const adjustmentValue = baseProfile.adjustmentValueForAll ?? 0
    return calculateNewPrice(
      baseBasedOnPrice,
      baseProfile.adjustmentType,
      adjustmentValue,
      baseProfile.incrementType,
    )
  }

  // Check if the product is in the base profile
  const productAdjustmentInBase = baseProfile.productAdjustments.find((p => p.productId === product._id));
  if (!productAdjustmentInBase) {
    // If product not in base profile, use global price
    return product.globalWholesalePrice
  }

  // Recursively calculate the price from the base profile
  return calculateNewPrice(
    baseBasedOnPrice,
    baseProfile.adjustmentType,
    productAdjustmentInBase.adjustmentValue,
    baseProfile.incrementType,
  )
}
