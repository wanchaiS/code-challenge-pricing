import { randomUUID } from "node:crypto";
import { ApiError, notFound } from "../middleware/errorHandler.js";
import { getCurrentUser } from "../shared/store.js";
import type { Product } from "./models/product.model.js";
import { buildProductReferenceLookups, mapProductDto } from "./product.mapper.js";
import { productRepository } from "./repositories/product.repository.js";
import {
  brandRepository,
  categoryRepository,
  segmentRepository,
  styleRepository,
  subCategoryRepository,
} from "./repositories/reference.repository.js";
import type {
  CreateProductInput,
  ProductDto,
  ProductQuery,
  UpdateProductInput,
} from "./schemas/product.schema.js";

export function listProductsService(filters: ProductQuery): ProductDto[] {
  const currentUser = getCurrentUser();
  const products = productRepository.search(currentUser.orgId, filters);
  const lookups = buildProductReferenceLookups(currentUser.orgId);
  return products.map((product) => mapProductDto(product, lookups));
}

export function searchProductsService(filters: ProductQuery): ProductDto[] {
  const hasFilters =
    Boolean(filters.search && filters.search.trim().length >= 2) ||
    Boolean(filters.brandId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.segmentId) ||
    Boolean(filters.subCategoryId);

  if (!hasFilters) {
    return [];
  }

  return listProductsService(filters);
}

export function getProductService(id: string): ProductDto {
  const currentUser = getCurrentUser();
  const product = ensureProductForOrg(id, currentUser.orgId);
  const lookups = buildProductReferenceLookups(currentUser.orgId);
  return mapProductDto(product, lookups);
}

export function createProductService(payload: CreateProductInput): ProductDto {
  const user = getCurrentUser();
  validateProductReferences(payload, user.orgId, {
    categoryId: payload.categoryId,
    subCategoryId: payload.subCategoryId,
  });

  const newProduct: Product = {
    _id: randomUUID(),
    orgId: user.orgId,
    brandId: payload.brandId,
    categoryId: payload.categoryId,
    globalWholesalePrice: payload.globalWholesalePrice,
    segmentId: payload.segmentId,
    skuCode: payload.skuCode,
    subCategoryId: payload.subCategoryId,
    title: payload.title,
    styleId: payload.styleId ?? undefined,
  };

  const created = productRepository.create(newProduct);
  const lookups = buildProductReferenceLookups(user.orgId);
  return mapProductDto(created, lookups);
}

export function updateProductService(
  id: string,
  payload: UpdateProductInput,
): ProductDto {
  const user = getCurrentUser();
  const existing = ensureProductForOrg(id, user.orgId);

  const targetCategoryId = payload.categoryId ?? existing.categoryId;
  const targetSubCategoryId = payload.subCategoryId ?? existing.subCategoryId;

  validateProductReferences(payload, user.orgId, {
    categoryId: targetCategoryId,
    subCategoryId: targetSubCategoryId,
  });

  const { styleId, ...rest } = payload;
  const normalizedUpdates: Partial<Product> = { ...rest } as Partial<Product>;
  if ("styleId" in payload) {
    normalizedUpdates.styleId = styleId ?? undefined;
  }

  const updated = productRepository.update(existing._id, normalizedUpdates);
  if (!updated) {
    throw notFound("Product");
  }

  const lookups = buildProductReferenceLookups(user.orgId);
  return mapProductDto(updated, lookups);
}

export function deleteProductService(id: string): void {
  const user = getCurrentUser();
  const existing = ensureProductForOrg(id, user.orgId);
  const deleted = productRepository.delete(existing._id);
  if (!deleted) {
    throw notFound("Product");
  }
}

const INVALID_PRODUCT_REFERENCE = "INVALID_PRODUCT_REFERENCE";

function ensureProductForOrg(id: string, orgId: string): Product {
  const product = productRepository.findById(id);
  if (product?.orgId !== orgId) {
    throw notFound("Product");
  }
  return product;
}

function ensureReference<T extends { orgId: string }>(
  entity: T | undefined,
  label: string,
  orgId: string,
): T {
  if (!entity || entity.orgId !== orgId) {
    throw new ApiError(400, `${label} not found for this organization`, INVALID_PRODUCT_REFERENCE);
  }
  return entity;
}

interface ReferenceContext {
  categoryId?: string;
  subCategoryId?: string;
}

function validateProductReferences(
  payload: Partial<CreateProductInput>,
  orgId: string,
  context: ReferenceContext,
): void {
  if (payload.brandId) {
    ensureReference(brandRepository.findById(payload.brandId), "Brand", orgId);
  }

  let resolvedCategoryId = context.categoryId;
  if (payload.categoryId) {
    const category = ensureReference(
      categoryRepository.findById(payload.categoryId),
      "Category",
      orgId,
    );
    resolvedCategoryId = category._id;
  } else if (resolvedCategoryId) {
    ensureReference(categoryRepository.findById(resolvedCategoryId), "Category", orgId);
  }

  let resolvedSubCategoryId = context.subCategoryId;
  let currentSubCategory: ReturnType<typeof subCategoryRepository.findById> | undefined;

  if (payload.subCategoryId) {
    currentSubCategory = ensureReference(
      subCategoryRepository.findById(payload.subCategoryId),
      "Subcategory",
      orgId,
    );
    resolvedSubCategoryId = currentSubCategory._id;
  } else if (resolvedSubCategoryId) {
    currentSubCategory = ensureReference(
      subCategoryRepository.findById(resolvedSubCategoryId),
      "Subcategory",
      orgId,
    );
  }

  if (currentSubCategory && resolvedCategoryId && currentSubCategory.categoryId !== resolvedCategoryId) {
    throw new ApiError(
      400,
      "Subcategory must belong to the selected category",
      INVALID_PRODUCT_REFERENCE,
    );
  }

  if (payload.segmentId) {
    ensureReference(segmentRepository.findById(payload.segmentId), "Segment", orgId);
  }

  if ("styleId" in payload) {
    const styleId = payload.styleId;
    if (styleId !== null && styleId !== undefined) {
      if (!resolvedSubCategoryId) {
        throw new ApiError(
          400,
          "Subcategory is required when specifying a style",
          INVALID_PRODUCT_REFERENCE,
        );
      }

      const style = ensureReference(styleRepository.findById(styleId), "Style", orgId);
      if (style.subCategoryId !== resolvedSubCategoryId) {
        throw new ApiError(
          400,
          "Style must belong to the selected subcategory",
          INVALID_PRODUCT_REFERENCE,
        );
      }
    }
  }
}
