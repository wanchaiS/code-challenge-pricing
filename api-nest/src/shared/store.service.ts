import { Injectable } from '@nestjs/common';
import { User } from './types';
import {
  Brand,
  Category,
  PricingProfile,
  Product,
  Segment,
  Style,
  SubCategory,
} from './models';
import {
  seedBrands,
  seedCategories,
  seedProducts,
  seedSegments,
  seedStyles,
  seedSubCategories,
  seedUser,
} from './seed.data';

/**
 * In-memory database service simulating MongoDB collections
 * This will be replaced with a real database in the future
 */
@Injectable()
export class StoreService {
  private db = {
    // Core entities
    pricingProfiles: [] as PricingProfile[],
    products: [...seedProducts],
    users: [seedUser],
    // Reference data
    brands: [...seedBrands],
    categories: [...seedCategories],
    subCategories: [...seedSubCategories],
    segments: [...seedSegments],
    styles: [...seedStyles],
  };

  // Getter methods for each collection
  getProducts(): Product[] {
    return this.db.products;
  }

  getProfiles(): PricingProfile[] {
    return this.db.pricingProfiles;
  }

  getUsers(): User[] {
    return this.db.users;
  }

  getBrands(): Brand[] {
    return this.db.brands;
  }

  getCategories(): Category[] {
    return this.db.categories;
  }

  getSubCategories(): SubCategory[] {
    return this.db.subCategories;
  }

  getSegments(): Segment[] {
    return this.db.segments;
  }

  getStyles(): Style[] {
    return this.db.styles;
  }

  /**
   * Helper to reset database to initial seed state
   */
  resetDb(): void {
    this.db.users = [seedUser];
    this.db.categories = [...seedCategories];
    this.db.subCategories = [...seedSubCategories];
    this.db.segments = [...seedSegments];
    this.db.styles = [...seedStyles];
    this.db.brands = [...seedBrands];
    this.db.products = [...seedProducts];
    this.db.pricingProfiles = [];
  }

  /**
   * Get current user (since we only have one user in this challenge)
   */
  getCurrentUser(): User {
    return this.db.users[0];
  }
}
