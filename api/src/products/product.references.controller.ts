import type { Request, Response } from "express";
import { getCurrentUser } from "../shared/store.js";
import {
  brandRepository,
  categoryRepository,
  segmentRepository,
  styleRepository,
  subCategoryRepository,
} from "./repositories/reference.repository.js";
import type { ProductReferencesDto } from "./schemas/product.schema.js";

export async function getProductReferences(
  _req: Request,
  res: Response<ProductReferencesDto>,
): Promise<void> {
  const user = getCurrentUser();
  const orgId = user.orgId;

  const categories = categoryRepository.findByOrgId(orgId);
  const subCategories = subCategoryRepository.findByOrgId(orgId);
  const segments = segmentRepository.findByOrgId(orgId);
  const brands = brandRepository.findByOrgId(orgId);

  const styles = styleRepository.findByOrgId(orgId);

  res.json({
    categories: categories.map(({ _id, name }) => ({ _id, name })),
    subCategories: subCategories.map(({ _id, name, categoryId }) => ({
      _id,
      name,
      categoryId,
    })),
    segments: segments.map(({ _id, name }) => ({ _id, name })),
    brands: brands.map(({ _id, name }) => ({ _id, name })),
    styles: styles.map(({ _id, name, subCategoryId }) => ({
      _id,
      name,
      subCategoryId,
    })),
  });
}
