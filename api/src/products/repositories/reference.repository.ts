import type { Brand, Category, Segment, Style, SubCategory } from '../models/references.model.js';
import { db } from '../../shared/store.js';

// Category Repository
export const categoryRepository = {
  /**
   * Find all categories for a given orgId
   */
  findByOrgId(orgId: string): Category[] {
    return db.categories.filter((c) => c.orgId === orgId)
  },

  /**
   * Find a single category by ID
   */
  findById(id: string): Category | undefined {
    return db.categories.find((c) => c._id === id)
  },

  /**
   * Get all categories
   */
  findAll(): Category[] {
    return db.categories
  },
}

// SubCategory Repository
export const subCategoryRepository = {
  /**
   * Find all subcategories for a given orgId
   */
  findByOrgId(orgId: string): SubCategory[] {
    return db.subCategories.filter((sc) => sc.orgId === orgId)
  },

  /**
   * Find a single subcategory by ID
   */
  findById(id: string): SubCategory | undefined {
    return db.subCategories.find((sc) => sc._id === id)
  },

  /**
   * Find subcategories by category ID
   */
  findByCategoryId(categoryId: string): SubCategory[] {
    return db.subCategories.filter((sc) => sc.categoryId === categoryId)
  },

  /**
   * Get all subcategories
   */
  findAll(): SubCategory[] {
    return db.subCategories
  },
}

// Segment Repository
export const segmentRepository = {
  /**
   * Find all segments for a given orgId
   */
  findByOrgId(orgId: string): Segment[] {
    return db.segments.filter((s) => s.orgId === orgId)
  },

  /**
   * Find a single segment by ID
   */
  findById(id: string): Segment | undefined {
    return db.segments.find((s) => s._id === id)
  },

  /**
   * Get all segments
   */
  findAll(): Segment[] {
    return db.segments
  },
}

// Brand Repository
export const brandRepository = {
  /**
   * Find all brands for a given orgId
   */
  findByOrgId(orgId: string): Brand[] {
    return db.brands.filter((b) => b.orgId === orgId)
  },

  /**
   * Find a single brand by ID
   */
  findById(id: string): Brand | undefined {
    return db.brands.find((b) => b._id === id)
  },

  /**
   * Get all brands
   */
  findAll(): Brand[] {
    return db.brands
  },
}

export const styleRepository = {
  findByOrgId(orgId: string): Style[] {
    return db.styles.filter((style) => style.orgId === orgId)
  },
  findBySubCategoryId(subCategoryId: string): Style[] {
    return db.styles.filter((style) => style.subCategoryId === subCategoryId)
  },
  findById(id: string): Style | undefined {
    return db.styles.find((style) => style._id === id)
  },
  findAll(): Style[] {
    return db.styles
  },
}
