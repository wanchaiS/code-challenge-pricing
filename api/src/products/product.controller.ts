import { productRepository } from "./repositories/product.repository.js";
import {
  brandRepository,
  categoryRepository,
  segmentRepository,
  subCategoryRepository,
} from "./repositories/reference.repository.js";
import { getCurrentUser } from "../shared/store.js";
import { notFound } from "../middleware/errorHandler.js";
import type { ProductDto, ProductIdParam, ProductQuery } from "./schemas/product.schema.js";
import type { Product } from "./models/product.model.js";
import type { NextFunction, Request, Response } from "express";


/**
 * GET /api/products
 * List products with optional search and filters
 */
export async function getProducts(
  req: Request<unknown, unknown, unknown, ProductQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currentUser = getCurrentUser();
    const filters = req.query;

    // Search products using repository
    const products = productRepository.search(currentUser.orgId, filters);

    // Map to view models
    res.json(products.map(mapProductDto));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export async function getProductById(
  req: Request<ProductIdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    const product = productRepository.findById(id);
    if (!product) {
      throw notFound("Product");
    }

    res.json(mapProductDto(product));
  } catch (error) {
    next(error);
  }
}

// ============================== Helpers ==============================
/**
 * Populate a product with reference data (brand, category, segment, subcategory)
 */
function mapProductDto(product: Product): ProductDto {
  const brand = brandRepository.findById(product.brandId);
  const category = categoryRepository.findById(product.categoryId);
  const segment = segmentRepository.findById(product.segmentId);
  const subCategory = subCategoryRepository.findById(product.subCategoryId);


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
