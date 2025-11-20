import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { productDtoSchema } from "../../products/schemas/product.schema.js";
import {
  AdjustmentType,
  IncrementType,
  SelectionType,
} from "../../shared/types.js";

extendZodWithOpenApi(z);

export const profileIdParamSchema = z.object({
  id: z.string().min(1, "Profile ID is required").openapi({
    description: "Pricing profile identifier",
    example: "profile-123",
  }),
});

export const selectionTypeSchema = z.enum(SelectionType).openapi({
  description: "Determines how products are selected for the profile",
  example: SelectionType.MULTIPLE,
});

export const productAdjustmentSchema = z
  .object({
    productId: z.string().min(1, "Product ID is required").openapi({
      description: "Product identifier",
      example: "prod-1",
    }),
    adjustmentValue: z
      .number()
      .min(0, "Adjustment value must be positive")
      .openapi({
        description:
          "Adjustment magnitude. Units depend on adjustmentType (fixed currency vs percentage).",
        example: 10,
      }),
  })
  .openapi("ProductAdjustment");

const uniqueAdjustmentsSchema = z.array(productAdjustmentSchema).refine(
  (adjustments) => {
    const ids = adjustments.map((item) => item.productId);
    return new Set(ids).size === ids.length;
  },
  {
    message: "Duplicate product adjustments are not allowed",
  },
);

const baseProfileFields = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or fewer")
    .openapi({
      description: "Profile display name",
      example: "Tenure Discount",
    }),
  basedOn: z
    .string()
    .min(1, "Base profile id is required")
    .nullish()
    .default(null)
    .openapi({
      description:
        "Base pricing profile. Null means use the global wholesale price.",
      example: null,
    }),
  adjustmentType: z.enum(AdjustmentType).openapi({
    description: "Whether the adjustment is fixed currency or percentage.",
    example: AdjustmentType.FIXED,
  }),
  incrementType: z.enum(IncrementType).openapi({
    description: "Indicates whether prices increase or decrease.",
    example: IncrementType.DECREASE,
  }),
});

const singleSelectionSchema = baseProfileFields.extend({
  selectionType: z.literal(SelectionType.ONE),
  adjustmentValueForAll: z.null().default(null),
  productAdjustments: uniqueAdjustmentsSchema.length(1),
});

const multiSelectionSchema = baseProfileFields.extend({
  selectionType: z.literal(SelectionType.MULTIPLE),
  adjustmentValueForAll: z.null().default(null),
  productAdjustments: uniqueAdjustmentsSchema.min(1, {
    message: "Multi-product profile must contain at least one adjustment",
  }),
});

const allSelectionSchema = baseProfileFields
  .extend({
    selectionType: z.literal(SelectionType.ALL),
    adjustmentValueForAll: z
      .number()
      .min(0, "All-products profile requires a non-negative adjustment value")
      .openapi({
        description: "Adjustment magnitude applied to every product in the profile",
        example: 10,
      }),
    productAdjustments: uniqueAdjustmentsSchema
      .default([])
      .openapi({
        description:
          "Optional overrides for all-products profiles. When omitted, the backend applies the adjustment to every product.",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.productAdjustments.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "All-products profile cannot include per-product adjustments",
        path: ["productAdjustments"],
      });
    }
  });

const profileCoreSchema = z.discriminatedUnion("selectionType", [
  singleSelectionSchema,
  multiSelectionSchema,
  allSelectionSchema,
]);

export const createProfileSchema = z
  .object({
    name: baseProfileFields.shape.name,
  })
  .openapi("CreateProfile");

export const updateProfileSchema = profileCoreSchema.openapi("UpdateProfile");

const profileMetadataSchema = z.object({
  _id: z.string().openapi({
    description: "Profile identifier",
    example: "profile-123",
  }),
  orgId: z.string().openapi({
    description: "Organization identifier that owns the profile",
    example: "org-1",
  }),
  createdAt: z.iso.datetime().openapi({
    description: "ISO timestamp when the profile was created",
  }),
  updatedAt: z.iso.datetime().openapi({
    description: "ISO timestamp when the profile was last updated",
  }),
});

export const pricingProfileSchema = profileCoreSchema
  .and(profileMetadataSchema)
  .openapi("PricingProfile");

export const profileDetailItemSchema = z.object({
  product: productDtoSchema,
  basedOnPrice: z.number().openapi({
    description: "Price used as the starting point before applying adjustments",
    example: 45,
  }),
  adjustmentValue: z.number().openapi({
    description: "Adjustment magnitude applied to the product",
    example: 5,
  }),
  newPrice: z.number().openapi({
    description: "Final calculated price after applying adjustments",
    example: 40,
  }),
});

export const profileDetailSchema = z.object({
  profile: pricingProfileSchema,
  items: z.array(profileDetailItemSchema),
});

export const profilePreviewResponseSchema = z.object({
  items: z.array(profileDetailItemSchema),
});
