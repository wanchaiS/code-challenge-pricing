import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from "zod";

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

// ============== Request Schemas (Query Parameters) ==============

/**
 * Schema for product query parameters (filters)
 */
export const productQuerySchema = z.object({
  search: z.string().optional().openapi({
    description: 'Fuzzy search by product title or SKU code',
    example: 'koyama',
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

/**
 * Segment DTO schema for API responses
 */
export const segmentDtoSchema = z.object({
  _id: z.string().openapi({ example: 'segment-1' }),
  name: z.string().openapi({ example: 'Red' }),
}).openapi('Segment');

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
export type SegmentDto = z.infer<typeof segmentDtoSchema>;
export type ErrorResponse = z.infer<typeof errorSchema>;
