import { Router } from "express";
import { z } from "zod";
import { registry } from "../config/swagger.js";
import { validate } from "../middleware/validation.js";
import { asyncHandler } from "../shared/asyncHandler.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  searchProducts,
  updateProduct,
} from "./product.controller.js";
import {
  createProductSchema,
  errorSchema,
  productDtoSchema,
  productIdSchema,
  productQuerySchema,
  updateProductSchema
} from "./schemas/product.schema.js";

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

// ============== Route: POST /api/products ==============

registry.registerPath({
  method: "post",
  path: "/api/products",
  summary: "Create a product",
  description: "Create a new product within the current organization",
  tags: ["Products"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created product",
      content: {
        "application/json": {
          schema: productDtoSchema,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.post("/", validate({ body: createProductSchema }), asyncHandler(createProduct));

// ============== Route: PUT /api/products/:id ==============

registry.registerPath({
  method: "put",
  path: "/api/products/{id}",
  summary: "Update a product",
  description: "Update an existing product owned by the current organization",
  tags: ["Products"],
  request: {
    params: productIdSchema,
    body: {
      content: {
        "application/json": {
          schema: updateProductSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated product",
      content: {
        "application/json": {
          schema: productDtoSchema,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.put(
  "/:id",
  validate({ params: productIdSchema, body: updateProductSchema }),
  asyncHandler(updateProduct),
);

// ============== Route: DELETE /api/products/:id ==============

registry.registerPath({
  method: "delete",
  path: "/api/products/{id}",
  summary: "Delete a product",
  description: "Remove a product owned by the current organization",
  tags: ["Products"],
  request: {
    params: productIdSchema,
  },
  responses: {
    204: {
      description: "Product deleted",
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.delete("/:id", validate({ params: productIdSchema }), asyncHandler(deleteProduct));

export default router;
