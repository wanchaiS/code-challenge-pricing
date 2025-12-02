import { Injectable } from '@nestjs/common';
import {
  badRequest,
  conflict,
  notFound,
} from '../../common/exceptions/api.exception';
import { Product } from '../../shared/models';
import { StoreService } from '../../shared/store.service';
import {
  AdjustmentType,
  IncrementType,
  SelectionType,
} from '../../shared/types';
import { CreateProfileDto } from '../dto/create-profile.dto';
import {
  ProfileDetailDto,
  ProfileDetailItemDto,
} from '../dto/profile-detail.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { PricingProfile } from '../entities/pricing-profile.entity';
import { ProfileRepository } from '../repositories/profile.repository';

/**
 * Service for pricing profile business logic
 */
@Injectable()
export class ProfilesService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly store: StoreService,
  ) {}

  /**
   * List all profiles for an organization
   */
  listProfiles(orgId: string): ProfileResponseDto[] {
    const profiles = this.repository.findByOrgId(orgId);
    return profiles.map((profile) => this.mapToResponseDto(profile));
  }

  /**
   * Create a new pricing profile
   */
  createProfile(orgId: string, dto: CreateProfileDto): ProfileResponseDto {
    // Check for duplicate name
    const existing = this.repository.findByNameAndOrgId(dto.name, orgId);
    if (existing) {
      throw conflict(
        `A pricing profile with name "${dto.name}" already exists`,
      );
    }

    const profile: PricingProfile = {
      _id: `profile-${Date.now()}`,
      ...dto,
      adjustmentType: AdjustmentType.FIXED,
      incrementType: IncrementType.DECREASE,
      basedOn: null,
      adjustmentValueForAll: dto.selectionType === SelectionType.ALL ? 0 : null,
      productAdjustments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId,
    };

    const created = this.repository.create(profile);
    return this.mapToResponseDto(created);
  }

  /**
   * Update an existing pricing profile
   */
  updateProfile(
    id: string,
    orgId: string,
    dto: UpdateProfileDto,
  ): ProfileResponseDto {
    const profile = this.repository.findById(id);
    if (!profile || profile.orgId !== orgId) {
      throw notFound('Pricing profile');
    }

    // Validate business rules
    this.validateUpdateDto(dto, orgId, id);

    // Normalize adjustments based on selection type
    const normalisedDto = this.normalizeProfileDto(dto);

    const merged = { ...profile, ...normalisedDto };
    const updated = this.repository.update(merged);
    if (!updated) {
      throw notFound('Pricing profile');
    }

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete a pricing profile with cascade logic
   */
  deleteProfile(id: string, orgId: string): void {
    const profile = this.repository.findById(id);
    if (!profile || profile.orgId !== orgId) {
      throw notFound('Pricing profile');
    }

    // Find all profiles that are based on this one
    const dependentProfiles = this.repository.findByBasedOn(id, orgId);

    // Update dependent profiles to point to this profile's basedOn
    for (const dependent of dependentProfiles) {
      this.repository.updateBasedOn(dependent._id, profile.basedOn);
    }

    // Delete the profile
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw notFound('Pricing profile');
    }
  }

  /**
   * Get profile detail with calculated prices for all products
   */
  getProfileDetail(id: string, orgId: string): ProfileDetailDto {
    const profile = this.repository.findById(id);
    if (!profile || profile.orgId !== orgId) {
      throw notFound('Pricing profile');
    }

    const items = this.buildProfileItems(profile);

    return {
      profile: this.mapToResponseDto(profile),
      items,
    };
  }

  /**
   * Preview profile pricing with unsaved changes
   */
  previewProfile(
    id: string,
    orgId: string,
    dto: UpdateProfileDto,
  ): ProfileDetailItemDto[] {
    const profile = this.repository.findById(id);
    if (!profile || profile.orgId !== orgId) {
      throw notFound('Pricing profile');
    }

    // Validate the preview DTO
    this.validateUpdateDto(dto, orgId, id);

    // Create a temporary profile with the updates
    const normalisedDto = this.normalizeProfileDto(dto);
    const previewProfile: PricingProfile = {
      ...profile,
      ...normalisedDto,
    };

    return this.buildProfileItems(previewProfile);
  }

  /**
   * Validate update DTO business rules
   */
  private validateUpdateDto(
    dto: UpdateProfileDto,
    orgId: string,
    currentId: string,
  ): void {
    const existing = this.repository.findById(currentId);
    if (!existing) {
      throw notFound('Pricing profile');
    }

    // Check for duplicate name if name is being changed
    if (dto.name) {
      const existingName = this.repository.findByNameAndOrgId(dto.name, orgId);
      if (existingName && existingName._id !== currentId) {
        throw conflict(
          `A pricing profile with name "${dto.name}" already exists`,
        );
      }
    }

    // Validate basedOn reference
    if (dto.basedOn !== undefined && dto.basedOn !== null) {
      const baseProfile = this.repository.findById(dto.basedOn);
      if (!baseProfile || baseProfile.orgId !== orgId) {
        throw badRequest(`Base profile "${dto.basedOn}" not found`);
      }

      // Prevent circular reference
      if (currentId && dto.basedOn === currentId) {
        throw badRequest('Profile cannot be based on itself');
      }
    }

    // Validate selection type rules
    if (dto.selectionType === SelectionType.ALL) {
      if (
        dto.adjustmentValueForAll === undefined ||
        dto.adjustmentValueForAll === null
      ) {
        throw badRequest(
          'adjustmentValueForAll is required when selectionType is "all"',
        );
      }
      if (dto.productAdjustments && dto.productAdjustments.length > 0) {
        throw badRequest(
          'productAdjustments must be empty when selectionType is "all"',
        );
      }
    } else if (dto.selectionType === SelectionType.ONE) {
      if (!dto.productAdjustments || dto.productAdjustments.length !== 1) {
        throw badRequest(
          'Exactly one product adjustment is required when selectionType is "one"',
        );
      }
    } else if (dto.selectionType === SelectionType.MULTIPLE) {
      if (!dto.productAdjustments || dto.productAdjustments.length === 0) {
        throw badRequest(
          'At least one product adjustment is required when selectionType is "multiple"',
        );
      }
    }

    // Validate that products exist
    if (dto.productAdjustments && dto.productAdjustments.length > 0) {
      const products = this.store.getProducts();
      const productIds = new Set(products.map((p) => p._id));

      for (const adj of dto.productAdjustments) {
        if (!productIds.has(adj.productId)) {
          throw badRequest(`Product "${adj.productId}" not found`);
        }
      }
    }
  }

  /**
   * Normalize adjustments based on selection type
   */
  private normalizeProfileDto(dto: UpdateProfileDto) {
    const updated: Partial<PricingProfile> = {
      name: dto.name,
      selectionType: dto.selectionType,
      adjustmentType: dto.adjustmentType,
      incrementType: dto.incrementType,
      basedOn: dto.basedOn,
    };

    if (dto.selectionType === SelectionType.ALL) {
      updated.adjustmentValueForAll = dto.adjustmentValueForAll ?? 0;
      updated.productAdjustments = [];
    } else {
      updated.adjustmentValueForAll = null;
      updated.productAdjustments = dto.productAdjustments ?? [];
    }

    return updated;
  }

  /**
   * Build profile items with calculated prices for all products
   */
  private buildProfileItems(profile: PricingProfile): ProfileDetailItemDto[] {
    const products = this.store.getProducts();

    // Create adjustment map for quick lookup
    const adjustmentMap = new Map<string, number>();
    for (const adj of profile.productAdjustments) {
      adjustmentMap.set(adj.productId, adj.adjustmentValue);
    }

    return products.map((product) => {
      const basedOnPrice = this.getBasedOnPrice(product, profile.basedOn);
      const adjustmentValue =
        profile.selectionType === SelectionType.ALL
          ? (profile.adjustmentValueForAll ?? 0)
          : (adjustmentMap.get(product._id) ?? 0);
      const newPrice = this.calculateNewPrice(
        basedOnPrice,
        profile.adjustmentType,
        adjustmentValue,
        profile.incrementType,
      );

      return {
        product,
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
  private calculateNewPrice(
    basedOnPrice: number,
    adjustmentType: AdjustmentType,
    adjustmentValue: number,
    incrementType: IncrementType,
  ): number {
    let newPrice: number;

    if (adjustmentType === AdjustmentType.FIXED) {
      // Fixed adjustment
      if (incrementType === IncrementType.INCREASE) {
        newPrice = basedOnPrice + adjustmentValue;
      } else {
        newPrice = basedOnPrice - adjustmentValue;
      }
    } else {
      // Dynamic (percentage) adjustment
      const percentageAmount = (basedOnPrice * adjustmentValue) / 100;

      if (incrementType === IncrementType.INCREASE) {
        newPrice = basedOnPrice + percentageAmount;
      } else {
        newPrice = basedOnPrice - percentageAmount;
      }
    }

    // Round to 2 decimal places, ensure price never goes negative
    return Math.max(0, Number(newPrice.toFixed(2)));
  }

  /**
   * Recursively resolves the "based on" price for a product across a chain of profiles.
   *
   * @param product - The product to price
   * @param basedOn - Profile ID to base pricing on, or null for global price
   * @returns The calculated base price after applying all profile adjustments in the chain
   *
   * @example
   * // Profile A: -10 AUD from global (280 → 270)
   * // Profile B: -5% from Profile A (270 → 256.50)
   * getBasedOnPrice(product, "profile-b") // Returns 256.50
   */
  private getBasedOnPrice(product: Product, basedOn: string | null): number {
    // If based on global, use the global wholesale price
    if (basedOn === null) {
      return product.globalWholesalePrice;
    }

    // Otherwise, look up the pricing profile
    const baseProfile = this.repository.findById(basedOn);
    if (!baseProfile) {
      // If profile not found, default to global
      return product.globalWholesalePrice;
    }

    const baseBasedOnPrice = this.getBasedOnPrice(product, baseProfile.basedOn);

    if (baseProfile.selectionType === SelectionType.ALL) {
      const adjustmentValue = baseProfile.adjustmentValueForAll ?? 0;
      return this.calculateNewPrice(
        baseBasedOnPrice,
        baseProfile.adjustmentType,
        adjustmentValue,
        baseProfile.incrementType,
      );
    }

    // Check if the product is in the base profile
    const productAdjustmentInBase = baseProfile.productAdjustments.find(
      (p) => p.productId === product._id,
    );
    if (!productAdjustmentInBase) {
      // If product not in base profile, inherit the already-computed base price
      // rather than dropping to global, so adjustments cascade through the chain.
      return baseBasedOnPrice;
    }

    // Recursively calculate the price from the base profile
    return this.calculateNewPrice(
      baseBasedOnPrice,
      baseProfile.adjustmentType,
      productAdjustmentInBase.adjustmentValue,
      baseProfile.incrementType,
    );
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(profile: PricingProfile): ProfileResponseDto {
    return {
      _id: profile._id,
      name: profile.name,
      selectionType: profile.selectionType,
      adjustmentType: profile.adjustmentType,
      incrementType: profile.incrementType,
      basedOn: profile.basedOn,
      adjustmentValueForAll: profile.adjustmentValueForAll,
      productAdjustments: profile.productAdjustments,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      orgId: profile.orgId,
    };
  }
}
