import { Injectable } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';
import { PricingProfile } from '../entities/pricing-profile.entity';

/**
 * Repository for pricing profile data access
 * Uses StoreService (in-memory database)
 */
@Injectable()
export class ProfileRepository {
  constructor(private readonly store: StoreService) {}

  /**
   * Find all profiles for an organization
   */
  findByOrgId(orgId: string): PricingProfile[] {
    return this.store.getProfiles().filter((p) => p.orgId === orgId);
  }

  /**
   * Find profile by ID
   */
  findById(id: string): PricingProfile | undefined {
    return this.store.getProfiles().find((p) => p._id === id);
  }

  /**
   * Find profile by name and organization (for uniqueness check)
   */
  findByNameAndOrgId(name: string, orgId: string): PricingProfile | undefined {
    return this.store
      .getProfiles()
      .find((p) => p.name === name && p.orgId === orgId);
  }

  /**
   * Find all profiles that are based on a specific profile
   * Used for cascade delete logic
   */
  findByBasedOn(basedOnId: string, orgId: string): PricingProfile[] {
    return this.store
      .getProfiles()
      .filter((p) => p.basedOn === basedOnId && p.orgId === orgId);
  }

  /**
   * Create a new profile with minimal data
   * Full configuration will be added via update
   */
  create(newProfile: PricingProfile): PricingProfile {
    this.store.getProfiles().push(newProfile);
    return newProfile;
  }

  /**
   * Update profile with new data
   */
  update(profile: PricingProfile): PricingProfile | null {
    const existingProfile = this.findById(profile._id);
    if (!existingProfile) return null;

    Object.assign(existingProfile, {
      ...profile,
      updatedAt: new Date(),
    });

    return existingProfile;
  }

  /**
   * Delete profile by ID
   */
  delete(id: string): boolean {
    const profiles = this.store.getProfiles();
    const index = profiles.findIndex((p) => p._id === id);
    if (index === -1) return false;

    profiles.splice(index, 1);
    return true;
  }

  /**
   * Update the basedOn reference for a profile
   * Used during cascade delete
   */
  updateBasedOn(profileId: string, newBasedOn: string | null): boolean {
    const profile = this.findById(profileId);
    if (!profile) return false;

    profile.basedOn = newBasedOn;
    profile.updatedAt = new Date();
    return true;
  }
}
