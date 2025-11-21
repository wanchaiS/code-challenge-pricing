import type { Request, Response } from "express";
import type {
  CreateProductInput,
  ProductIdParam,
  ProductQuery,
  UpdateProductInput,
} from "./schemas/product.schema.js";
import {
  createProductService,
  deleteProductService,
  getProductService,
  listProductsService,
  searchProductsService,
  updateProductService,
} from "./product.service.js";

/**
 * GET /api/products
 * List products with optional search and filters
 */
export async function getProducts(
  req: Request<unknown, unknown, unknown, ProductQuery>,
  res: Response,
): Promise<void> {
  const products = listProductsService(req.query);
  res.json(products);
}

/**
 * GET /api/products/search
 */
export async function searchProducts(
  req: Request<unknown, unknown, unknown, ProductQuery>,
  res: Response,
): Promise<void> {
  const products = searchProductsService(req.query);
  res.json(products);
}

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export async function getProductById(
  req: Request<ProductIdParam>,
  res: Response,
): Promise<void> {
  const product = getProductService(req.params.id);
  res.json(product);
}

/**
 * POST /api/products
 * Create a new product
 */
export async function createProduct(
  req: Request<unknown, unknown, CreateProductInput>,
  res: Response,
): Promise<void> {
  const product = createProductService(req.body);
  res.status(201).json(product);
}

/**
 * PUT /api/products/:id
 * Update an existing product
 */
export async function updateProduct(
  req: Request<ProductIdParam, unknown, UpdateProductInput>,
  res: Response,
): Promise<void> {
  const product = updateProductService(req.params.id, req.body);
  res.json(product);
}

/**
 * DELETE /api/products/:id
 */
export async function deleteProduct(
  req: Request<ProductIdParam>,
  res: Response,
): Promise<void> {
  deleteProductService(req.params.id);
  res.status(204).send();
}
