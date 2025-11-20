import type { Product } from "./models/product.model.js";
import type { Brand, Category, Segment, SubCategory } from "./models/references.model.js";
import {
  brandRepository,
  categoryRepository,
  segmentRepository,
  subCategoryRepository,
} from "./repositories/reference.repository.js";
import type { ProductDto } from "./schemas/product.schema.js";

export interface ProductReferenceLookups {
  brands: Map<string, Brand>;
  categories: Map<string, Category>;
  segments: Map<string, Segment>;
  subCategories: Map<string, SubCategory>;
}

// Build lookup maps for reference data by orgId
// to solve N + 1 query problem when mapping products
// assume that the the list of reference data per org is small enough to fit in memory
export function buildProductReferenceLookups(orgId: string): ProductReferenceLookups {
  const brands = brandRepository.findByOrgId(orgId);
  const categories = categoryRepository.findByOrgId(orgId);
  const segments = segmentRepository.findByOrgId(orgId);
  const subCategories = subCategoryRepository.findByOrgId(orgId);

  return {
    brands: new Map(brands.map((entry) => [entry._id, entry])),
    categories: new Map(categories.map((entry) => [entry._id, entry])),
    segments: new Map(segments.map((entry) => [entry._id, entry])),
    subCategories: new Map(subCategories.map((entry) => [entry._id, entry])),
  };
}

export function mapProductDto(product: Product, lookups: ProductReferenceLookups): ProductDto {
  const brand = lookups.brands.get(product.brandId);
  const category = lookups.categories.get(product.categoryId);
  const segment = lookups.segments.get(product.segmentId);
  const subCategory = lookups.subCategories.get(product.subCategoryId);

  return {
    _id: product._id,
    brand: brand ? { _id: brand._id, name: brand.name } : null,
    category: category ? { _id: category._id, name: category.name } : null,
    globalWholesalePrice: product.globalWholesalePrice,
    segment: segment ? { _id: segment._id, name: segment.name } : null,
    skuCode: product.skuCode,
    subCategory: subCategory ? { _id: subCategory._id, name: subCategory.name } : null,
    title: product.title,
  };
}
