import { Router } from "express";
import { registry } from "../config/swagger.js";
import { asyncHandler } from "../shared/asyncHandler.js";
import { getProductReferences } from "./product.references.controller.js";
import {
    errorSchema,
    productReferencesSchema
} from "./schemas/product.schema.js";

const router = Router();

// ============== Route: GET /api/products-references ==============

registry.registerPath({
  method: "get",
  path: "/api/products-references",
  summary: "List references data",
  description:
    "Returns categories, subcategories, segments, and brands.",
  tags: ["Products"],
  responses: {
    200: {
      description: "References data",
      content: {
        "application/json": {
          schema: productReferencesSchema,
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

router.get("/", asyncHandler(getProductReferences));

export default router;