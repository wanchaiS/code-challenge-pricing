import Fuse from 'fuse.js';
import type { Product, ProductFilter } from '../models/product.model.js';
import { db } from '../../shared/store.js';

export const productRepository = {
  /**
   * Find all products for a given orgId
   */
  findByOrgId(orgId: string): Product[] {
    return db.products.filter((p) => p.orgId === orgId)
  },

  /**
   * Find a single product by ID
   */
  findById(id: string): Product | undefined {
    return db.products.find((p) => p._id === id)
  },

  /**
   * Find products by IDs
   */
  findByIds(ids: string[]): Product[] {
    return db.products.filter((p) => ids.includes(p._id))
  },

  /**
    * Search and filter products
    * In production if we have large dataset, we would use MongoDB Atlas Search which supports
    * both fuzzy search and filtering in a single query.
    * Here we simulate it with in-memory filtering + Fuse.js for fuzzy search.
   */
  search(orgId: string, filters: ProductFilter): Product[] {
    // ─────────────────────────────────────────────────────────────────
    // Stage 1: Filter by orgId (simulates $match)
    // ─────────────────────────────────────────────────────────────────
    let products = this.findByOrgId(orgId)

    // ─────────────────────────────────────────────────────────────────
    // Stage 2: Apply exact filters BEFORE fuzzy search (more efficient)
    // ─────────────────────────────────────────────────────────────────

    if (filters.brandId) {
      products = products.filter((p) => p.brandId === filters.brandId)
    }

    if (filters.segmentId) {
      products = products.filter((p) => p.segmentId === filters.segmentId)
    }

    if (filters.subCategoryId) {
      products = products.filter((p) => p.subCategoryId === filters.subCategoryId)
    }

    // ─────────────────────────────────────────────────────────────────
    // Stage 3: Fuzzy search on the ALREADY FILTERED dataset
    // ─────────────────────────────────────────────────────────────────

    if (filters.search) {
      const fuse = new Fuse(products, {
        includeScore: true,
        keys: ['title', 'skuCode'], 
        minMatchCharLength: 2, 
        threshold: 0.4, // 0 = exact match, 1 = match anything
      })

      const fuzzyResults = fuse.search(filters.search)
      products = fuzzyResults.map((result) => result.item)
    }

    return products
  },

  /**
   * Create a new product 
   */
  create(product: Product): Product {
    db.products.push(product)
    return product
  },

  /**
   * Update a product 
   */
  update(id: string, updates: Partial<Product>): Product | null {
    const index = db.products.findIndex((p) => p._id === id)
    if (index === -1) {
      return null
    }

    const existing = db.products[index]
    if (!existing) return null  

    const updated = { ...existing, ...updates }
    db.products[index] = updated

    return updated

  },

  /**
   * Delete a product 
   */
  delete(id: string): boolean {
    const index = db.products.findIndex((p) => p._id === id)
    if (index === -1) {
      return false
    }

    db.products.splice(index, 1)
    return true
  },
}
