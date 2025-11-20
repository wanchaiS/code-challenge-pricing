import { productRepository } from "./repositories/product.repository.js";
import { getCurrentUser } from "../shared/store.js";
import { notFound } from "../middleware/errorHandler.js";
import type { ProductIdParam, ProductQuery } from "./schemas/product.schema.js";
import { mapProductDto, buildProductReferenceLookups } from "./product.mapper.js";
import type { Request, Response } from "express";

/**
 * GET /api/products
 * List products with optional search and filters
 */
export async function getProducts(
  req: Request<unknown, unknown, unknown, ProductQuery>,
  res: Response,
): Promise<void> {
  const currentUser = getCurrentUser();
  const filters = req.query;

  const products = productRepository.search(currentUser.orgId, filters);
  const lookups = buildProductReferenceLookups(currentUser.orgId);
  res.json(products.map((product) => mapProductDto(product, lookups)));
}

export async function searchProducts(
  req: Request<unknown, unknown, unknown, ProductQuery>,
  res: Response,
): Promise<void> {
  const currentUser = getCurrentUser();
  const filters = req.query;

  const hasFilters =
    Boolean(filters.search && filters.search.trim().length >= 2) ||
    Boolean(filters.brandId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.segmentId) ||
    Boolean(filters.subCategoryId);

  if (!hasFilters) {
    res.json([]);
    return;
  }

  const products = productRepository.search(currentUser.orgId, filters);
  const lookups = buildProductReferenceLookups(currentUser.orgId);
  res.json(products.map((product) => mapProductDto(product, lookups)));
}

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export async function getProductById(
  req: Request<ProductIdParam>,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  const currentUser = getCurrentUser();
  const product = productRepository.findById(id);
  if (!product) {
    throw notFound("Product");
  }

  const lookups = buildProductReferenceLookups(currentUser.orgId);
  res.json(mapProductDto(product, lookups));
}
