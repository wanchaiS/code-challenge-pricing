import { getProductById, getProducts, searchProducts } from "./product.controller.js";
import { getProductFilterOptions } from "./product.filters.controller.js";
import { registry } from "../config/swagger.js";
import { validate } from "../middleware/validation.js";
import {
  errorSchema,
  productDtoSchema,
  productIdSchema,
  productQuerySchema,
  productFilterOptionsSchema,
} from "./schemas/product.schema.js";
import { Router } from "express";
import { asyncHandler } from "../shared/asyncHandler.js";
import { z } from "zod";

const router = Router();

// ============== Route: GET /api/products ==============

// Register OpenAPI documentation for GET /api/products
registry.registerPath({
  method: 'get',
  path: '/api/products',
  summary: 'List all products',
  description: 'Get all products with optional search and filters',
  tags: ['Products'],
  request: {
    query: productQuerySchema,
  },
  responses: {
    200: {
      description: 'List of products with populated references',
      content: {
        'application/json': {
          schema: z.array(productDtoSchema),
        },
      },
    },
    400: {
      description: 'Invalid query parameters',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
});

router.get("/", validate({ query: productQuerySchema }), asyncHandler(getProducts));

// ============== Route: GET /api/products/search ==============

registry.registerPath({
  method: "get",
  path: "/api/products/search",
  summary: "Search products",
  description:
    "Fuzzy search + filters for UI usage. Returns an empty array when no filters/search are provided.",
  tags: ["Products"],
  request: {
    query: productQuerySchema,
  },
  responses: {
    200: {
      description: "Filtered products",
      content: {
        "application/json": {
          schema: z.array(productDtoSchema),
        },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.get(
  "/search",
  validate({ query: productQuerySchema }),
  asyncHandler(searchProducts),
);

// ============== Route: GET /api/products/filters ==============

registry.registerPath({
  method: "get",
  path: "/api/products/filters",
  summary: "List filter reference data",
  description:
    "Returns categories, subcategories, segments, and brands for populating search filters.",
  tags: ["Products"],
  responses: {
    200: {
      description: "Filter reference data",
      content: {
        "application/json": {
          schema: productFilterOptionsSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.get("/filters", asyncHandler(getProductFilterOptions));

// ============== Route: GET /api/products/:id ==============

// Register OpenAPI documentation for GET /api/products/:id
registry.registerPath({
  method: 'get',
  path: '/api/products/{id}',
  summary: 'Get a product by ID',
  description: 'Retrieve a single product with populated references',
  tags: ['Products'],
  request: {
    params: productIdSchema,
  },
  responses: {
    200: {
      description: 'Product details',
      content: {
        'application/json': {
          schema: productDtoSchema,
        },
      },
    },
    404: {
      description: 'Product not found',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
});

router.get("/:id", validate({ params: productIdSchema }), asyncHandler(getProductById));

export default router;
