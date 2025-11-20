import { Router } from "express";
import { registry } from "../config/swagger.js";
import { validate } from "../middleware/validation.js";
import { asyncHandler } from "../shared/asyncHandler.js";
import {
  createProfileController,
  deleteProfileController,
  getProfileController,
  getProfilesController,
  previewProfileController,
  updateProfileController,
} from "./profile.controller.js";
import {
  createProfileSchema,
  pricingProfileSchema,
  profileDetailSchema,
  profileIdParamSchema,
  updateProfileSchema,
  profilePreviewResponseSchema,
} from "./schemas/profile.schema.js";
import { errorSchema } from "../products/schemas/product.schema.js";
import { z } from "zod";

const router = Router();

registry.register("PricingProfile", pricingProfileSchema);
registry.register("PricingProfileDetail", profileDetailSchema);
registry.register("PricingProfilePreview", profilePreviewResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/pricing-profiles",
  summary: "List pricing profiles",
  description: "Fetch all pricing profiles for the current organization",
  tags: ["Pricing Profiles"],
  responses: {
    200: {
      description: "List of pricing profiles",
      content: {
        "application/json": {
          schema: z.array(pricingProfileSchema),
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

router.get("/", asyncHandler(getProfilesController));

registry.registerPath({
  method: "post",
  path: "/api/pricing-profiles",
  summary: "Create a pricing profile",
  tags: ["Pricing Profiles"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createProfileSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Profile created",
      content: {
        "application/json": {
          schema: pricingProfileSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.post("/", validate({ body: createProfileSchema }), asyncHandler(createProfileController));

registry.registerPath({
  method: "get",
  path: "/api/pricing-profiles/{id}",
  summary: "Get a pricing profile",
  tags: ["Pricing Profiles"],
  request: {
    params: profileIdParamSchema,
  },
  responses: {
    200: {
      description: "Pricing profile details with calculated product prices",
      content: {
        "application/json": {
          schema: profileDetailSchema,
        },
      },
    },
    404: {
      description: "Profile not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.get("/:id", validate({ params: profileIdParamSchema }), asyncHandler(getProfileController));

registry.registerPath({
  method: "put",
  path: "/api/pricing-profiles/{id}",
  summary: "Update a pricing profile",
  tags: ["Pricing Profiles"],
  request: {
    params: profileIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated profile",
      content: {
        "application/json": {
          schema: pricingProfileSchema,
        },
      },
    },
    400: {
      description: "Invalid payload",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Profile not found",
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
  validate({ params: profileIdParamSchema, body: updateProfileSchema }),
  asyncHandler(updateProfileController),
);

registry.registerPath({
  method: "post",
  path: "/api/pricing-profiles/{id}/preview",
  summary: "Preview pricing profile adjustments",
  description: "Calculate adjusted prices without persisting changes",
  tags: ["Pricing Profiles"],
  request: {
    params: profileIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Calculated prices for the provided configuration",
      content: {
        "application/json": {
          schema: profilePreviewResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid payload",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.post(
  "/:id/preview",
  validate({ params: profileIdParamSchema, body: updateProfileSchema }),
  asyncHandler(previewProfileController),
);

registry.registerPath({
  method: "delete",
  path: "/api/pricing-profiles/{id}",
  summary: "Delete a pricing profile",
  tags: ["Pricing Profiles"],
  request: {
    params: profileIdParamSchema,
  },
  responses: {
    204: {
      description: "Profile deleted",
    },
    404: {
      description: "Profile not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

router.delete("/:id", validate({ params: profileIdParamSchema }), asyncHandler(deleteProfileController));

export default router;
