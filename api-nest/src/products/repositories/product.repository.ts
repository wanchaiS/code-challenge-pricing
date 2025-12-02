import { Injectable } from '@nestjs/common';
import Fuse from 'fuse.js';
import { Product } from 'src/shared/models';
import { StoreService } from 'src/shared/store.service';
import { SearchFilters } from '../dto/search-filters';

@Injectable()
export class ProductRepository {
  constructor(private readonly store: StoreService) {}

  findByOrgId(orgId: string) {
    return this.store.getProducts().filter((p) => p.orgId === orgId);
  }

  findById(id: string) {
    return this.store.getProducts().find((p) => p._id === id);
  }

  findByIds(ids: string[]) {
    return this.store.getProducts().filter((p) => ids.includes(p._id));
  }

  /**
   * Search and filter products
   * In production if we have large dataset, we would use MongoDB Atlas Search which supports
   * both fuzzy search and filtering in a single query.
   * Here we simulate it with in-memory filtering + Fuse.js for fuzzy search.
   */
  search(orgId: string, filters: SearchFilters) {
    // ─────────────────────────────────────────────────────────────────
    // Stage 1: Filter by orgId (simulates $match)
    // ─────────────────────────────────────────────────────────────────
    let products = this.findByOrgId(orgId);

    // ─────────────────────────────────────────────────────────────────
    // Stage 2: Apply exact filters BEFORE fuzzy search (more efficient)
    // ─────────────────────────────────────────────────────────────────

    if (filters.brandId) {
      products = products.filter((p) => p.brandId === filters.brandId);
    }

    if (filters.categoryId) {
      products = products.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters.segmentId) {
      products = products.filter((p) => p.segmentId === filters.segmentId);
    }

    if (filters.subCategoryId) {
      products = products.filter(
        (p) => p.subCategoryId === filters.subCategoryId,
      );
    }

    if (filters.styleId) {
      products = products.filter((p) => p.styleId === filters.styleId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Stage 3: Fuzzy search on the ALREADY FILTERED dataset
    // ─────────────────────────────────────────────────────────────────

    if (filters.search) {
      const fuse = new Fuse(products, {
        includeScore: true,
        keys: !filters.searchField
          ? ['title', 'skuCode']
          : [filters.searchField],
        minMatchCharLength: 2,
        threshold: 0.4, // 0 = exact match, 1 = match anything
      });

      const fuzzyResults = fuse.search(filters.search);
      products = fuzzyResults.map((result) => result.item);
    }

    return products;
  }

  create(product: Product) {
    this.store.getProducts().push(product);
    return product;
  }

  update(id: string, updates: Partial<Product>) {
    const product = this.findById(id);
    if (!product) return null;

    Object.assign(product, {
      ...updates,
      updatedAt: new Date(),
    });

    return product;
  }

  delete(id: string) {
    const products = this.store.getProducts();
    const index = products.findIndex((p) => p._id === id);
    if (index === -1) return false;

    products.splice(index, 1);
    return true;
  }
}
