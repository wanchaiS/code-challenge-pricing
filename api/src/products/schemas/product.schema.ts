import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from "zod";

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

// ============== Request Schemas (Query Parameters) ==============

/**
 * Schema for product query parameters (filters)
 */
export const searchFieldSchema = z.enum(["title", "skuCode"]).openapi({
  description: "Restrict fuzzy search to a specific field. Omit to search both.",
  example: "title",
});

export const productQuerySchema = z.object({
  search: z.string().optional().openapi({
    description: 'Fuzzy search by product title or SKU code',
    example: 'koyama',
  }),
  searchField: searchFieldSchema.optional(),
  categoryId: z.string().optional().openapi({
    description: 'Filter by category ID',
    example: 'category-1',
  }),
  subCategoryId: z.string().optional().openapi({
    description: 'Filter by subcategory ID',
    example: 'subcategory-1',
  }),
  segmentId: z.string().optional().openapi({
    description: 'Filter by segment ID',
    example: 'segment-1',
  }),
  brandId: z.string().optional().openapi({
    description: 'Filter by brand ID',
    example: 'brand-1',
  }),
  styleId: z.string().optional().openapi({
    description: 'Filter by style ID (wine only)',
    example: 'style-1',
  }),
}).strict();

/**
 * Schema for product ID parameter
 */
export const productIdSchema = z.object({
  id: z.string().min(1, "Product ID is required").openapi({
    description: 'Product ID',
    example: 'product-1',
  }),
});

/**
 * Shared payload fields for create/update operations
 */
const productPayloadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .openapi({ description: "Product title", example: "High Garden Pinot Noir 2021" }),
  skuCode: z
    .string()
    .min(1, "SKU code is required")
    .openapi({ description: "SKU code", example: "HGVPIN216" }),
  globalWholesalePrice: z
    .number()
    .nonnegative("Price must be zero or greater")
    .openapi({ description: "Global wholesale price", example: 275.5 }),
  brandId: z
    .string()
    .min(1, "Brand is required")
    .openapi({ description: "Brand ID", example: "brand-1" }),
  categoryId: z
    .string()
    .min(1, "Category is required")
    .openapi({ description: "Category ID", example: "cat-1" }),
  subCategoryId: z
    .string()
    .min(1, "Subcategory is required")
    .openapi({ description: "Subcategory ID", example: "subcat-1" }),
  segmentId: z
    .string()
    .min(1, "Segment is required")
    .openapi({ description: "Segment ID", example: "seg-1" }),
  styleId: z
    .string()
    .min(1)
    .optional()
    .nullable()
    .openapi({ description: "Optional style ID", example: "style-1" }),
}).strict();

export const createProductSchema = productPayloadSchema.openapi("CreateProductInput");

export const updateProductSchema = productPayloadSchema
  .partial()
  .refine(
    (payload) => Object.keys(payload).length > 0,
    "At least one field must be provided",
  )
  .openapi("UpdateProductInput");

// ============== Response Schemas (DTOs) ==============

/**
 * Brand DTO schema for API responses
 */
export const brandDtoSchema = z.object({
  _id: z.string().openapi({ example: 'brand-1' }),
  name: z.string().openapi({ example: 'High Garden' }),
}).openapi('Brand');

/**
 * Category DTO schema for API responses
 */
export const categoryDtoSchema = z.object({
  _id: z.string().openapi({ example: 'category-1' }),
  name: z.string().openapi({ example: 'Alcoholic Beverage' }),
}).openapi('Category');

/**
 * SubCategory DTO schema for API responses
 */
export const subCategoryDtoSchema = z.object({
  _id: z.string().openapi({ example: 'subcategory-1' }),
  name: z.string().openapi({ example: 'Wine' }),
}).openapi('SubCategory');

export const subCategoryFilterSchema = subCategoryDtoSchema.extend({
  categoryId: z.string().openapi({ example: 'category-1' }),
}).openapi('SubCategoryFilter');

/**
 * Segment DTO schema for API responses
 */
export const segmentDtoSchema = z.object({
  _id: z.string().openapi({ example: 'segment-1' }),
  name: z.string().openapi({ example: 'Red' }),
}).openapi('Segment');

export const styleDtoSchema = z.object({
  _id: z.string().openapi({ example: 'style-1' }),
  name: z.string().openapi({ example: 'Pinot Noir' }),
  subCategoryId: z.string().openapi({ example: 'subcat-1' }),
}).openapi('Style');

export const productFilterOptionsSchema = z.object({
  categories: z.array(categoryDtoSchema).openapi({
    description: 'Available product categories for the current organization',
  }),
  subCategories: z.array(subCategoryFilterSchema).openapi({
    description: 'Available subcategories for the current organization',
  }),
  segments: z.array(segmentDtoSchema).openapi({
    description: 'Available product segments for the current organization',
  }),
  brands: z.array(brandDtoSchema).openapi({
    description: 'Available brands for the current organization',
  }),
  styles: z.array(styleDtoSchema).openapi({
    description: 'Available styles (wine only). Empty when supplier has no wine.',
  }),
}).openapi('ProductFilterOptions');

/**
 * Product DTO schema for API responses
 */
export const productDtoSchema = z.object({
  _id: z.string().openapi({
    description: 'Product ID',
    example: 'product-1',
  }),
  title: z.string().openapi({
    description: 'Product title',
    example: 'High Garden Pinot Noir 2021',
  }),
  skuCode: z.string().openapi({
    description: 'SKU code',
    example: 'HGVPIN216',
  }),
  globalWholesalePrice: z.number().openapi({
    description: 'Global wholesale price',
    example: 279.06,
  }),
  brand: brandDtoSchema.nullable().openapi({
    description: 'Brand information',
  }),
  category: categoryDtoSchema.nullable().openapi({
    description: 'Category information',
  }),
  subCategory: subCategoryDtoSchema.nullable().openapi({
    description: 'SubCategory information',
  }),
  segment: segmentDtoSchema.nullable().openapi({
    description: 'Segment information',
  }),
  style: styleDtoSchema.nullable().openapi({
    description: 'Style information (wine only)',
  }),
}).openapi('ProductDto');

/**
 * Error response schema
 */
export const errorSchema = z.object({
  error: z.string().openapi({
    description: 'Error type',
    example: 'Validation Error',
  }),
  message: z.string().openapi({
    description: 'Error message',
    example: 'Invalid request data',
  }),
  details: z.array(z.object({
    path: z.string().openapi({
      description: 'Field path',
      example: 'query.search',
    }),
    message: z.string().openapi({
      description: 'Field error message',
      example: 'Invalid value',
    }),
  })).optional().openapi({
    description: 'Detailed validation errors',
  }),
}).openapi('Error');

// ============== Inferred TypeScript Types ==============
// These are the single source of truth for API types

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductIdParam = z.infer<typeof productIdSchema>;
export type ProductDto = z.infer<typeof productDtoSchema>;
export type BrandDto = z.infer<typeof brandDtoSchema>;
export type CategoryDto = z.infer<typeof categoryDtoSchema>;
export type SubCategoryDto = z.infer<typeof subCategoryDtoSchema>;
export type SubCategoryFilterDto = z.infer<typeof subCategoryFilterSchema>;
export type SegmentDto = z.infer<typeof segmentDtoSchema>;
export type StyleDto = z.infer<typeof styleDtoSchema>;
export type ProductFilterOptionsResponse = z.infer<
  typeof productFilterOptionsSchema
>;
export type SearchField = z.infer<typeof searchFieldSchema>;
export type ErrorResponse = z.infer<typeof errorSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
