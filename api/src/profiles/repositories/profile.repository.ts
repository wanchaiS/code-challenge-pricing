import { randomUUID } from "crypto";
import { db } from '#shared/store.js';
import { AdjustmentType, IncrementType } from '#shared/types.js';
import type { CreatePricingProfileInput, PricingProfile, UpdatePricingProfileInput } from '../models/profile.model.js';

export const profileRepository = {
  /**
   * Find all pricing profiles for a orgId
   */
  findByOrgId(orgId: string): PricingProfile[] {
    return db.pricingProfiles.filter((p) => p.orgId === orgId)
  },

  /**
   * Find a single pricing profile by ID
   */
  findById(id: string): PricingProfile | undefined {
    return db.pricingProfiles.find((p) => p._id === id)
  },

  /**
   *
  * Find a single pricing profile by name and orgId
   */
  findByNameAndOrgId(name: string, orgId: string): PricingProfile | undefined {
    return db.pricingProfiles.find((p) => p.name === name && p.orgId === orgId)
  },

  /**
   * Find all pricing profiles that are based on a specific profile
   */
  findByBasedOn(basedOnId: string, orgId: string): PricingProfile[] {
    return db.pricingProfiles.filter((p) => p.basedOn === basedOnId && p.orgId === orgId)
  },

  /**
   * Update the basedOn field for a specific profile
   */
  updateBasedOn(profileId: string, newBasedOn: string | null): boolean {
    const index = db.pricingProfiles.findIndex((p) => p._id === profileId)
    if (index === -1) {
      return false
    }

    db.pricingProfiles[index] = {
      ...db.pricingProfiles[index]!,
      basedOn: newBasedOn,
      updatedAt: new Date(),
    }

    return true
  },

  /**
   * Create a new pricing profile
   */
  create(orgId: string, dto: CreatePricingProfileInput): PricingProfile {
    const now = new Date()
    const profile: PricingProfile = {
      _id: randomUUID(),
      adjustmentType: AdjustmentType.DYNAMIC,
      basedOn: null,
      createdAt: now,
      adjustmentValueForAll: null,
      selectionType: dto.selectionType,
      incrementType: IncrementType.DECREASE,
      name: dto.name,
      productAdjustments: [],
      updatedAt: now,
      orgId,
    }

    db.pricingProfiles.push(profile)
    return profile
  },

  /**
   * Update a pricing profile
   */
  update(id: string, dto: UpdatePricingProfileInput): PricingProfile | null {
    const index = db.pricingProfiles.findIndex((p) => p._id === id)
    if (index === -1) {
      return null
    }

    const existing = db.pricingProfiles[index]
    if (!existing) {
      return null
    }

    db.pricingProfiles[index] = {
      ...existing,
      ...dto,
      updatedAt: new Date(),
    }

    return db.pricingProfiles[index]
  },

  /**
   * Delete a pricing profile
   */
  delete(id: string): boolean {
    const index = db.pricingProfiles.findIndex((p) => p._id === id)
    if (index === -1) {
      return false
    }

    db.pricingProfiles.splice(index, 1)
    return true
  },
}
