import type { Product } from "#products/models/product.model.js";
import { beforeEach, describe, expect, it } from "vitest";
import { db, resetDb } from "../../shared/store.js";
import { AdjustmentType, IncrementType, SelectionType } from "../../shared/types.js";
import { calculateNewPrice, getBasedOnPrice } from "../profile.service.js";

describe("pricing calculations", () => {
  beforeEach(() => {
    resetDb();
  });

  it("calculates fixed and dynamic adjustments", () => {
    // Fixed increase should add the raw adjustment value.
    expect(calculateNewPrice(100, AdjustmentType.FIXED, 10, IncrementType.INCREASE)).toBe(110);
    // Fixed decrease subtracts the value and clamps at zero.
    expect(calculateNewPrice(100, AdjustmentType.FIXED, 15, IncrementType.DECREASE)).toBe(85);
    // Dynamic increase applies a percentage of the based-on price.
    expect(calculateNewPrice(100, AdjustmentType.DYNAMIC, 25, IncrementType.INCREASE)).toBe(125);
    // Dynamic decrease subtracts the percentage amount.
    expect(calculateNewPrice(100, AdjustmentType.DYNAMIC, 60, IncrementType.DECREASE)).toBe(40);
    // Never allow negative results for any formula.
    expect(calculateNewPrice(10, AdjustmentType.FIXED, 50, IncrementType.DECREASE)).toBe(0);
  });

  it("walks based-on chain across multiple profiles", () => {
    // Scenario: there is a base profile that subtracts $10 from the global price
    // for a specific product, and a child profile (selection=all) that inherits
    // from the base profile and then applies a 5% decrease. The final based-on
    // price should reflect both adjustments in order.
    const product = db.products[0];
    if (!product) {
      throw new Error("Seed product missing");
    }
    const user = db.users[0];
    if (!user) {
      throw new Error("Seed user missing");
    }

    seedProfileChain(product, user.orgId);

    const price = getBasedOnPrice(product, "child-profile");
    const expectedAfterBase = calculateNewPrice(
      product.globalWholesalePrice,
      AdjustmentType.FIXED,
      10,
      IncrementType.DECREASE,
    );
    const expectedAfterChild = calculateNewPrice(
      expectedAfterBase,
      AdjustmentType.DYNAMIC,
      5,
      IncrementType.DECREASE,
    );

    expect(price).toBe(expectedAfterChild);
  });
});

function seedProfileChain(product: Product, orgId: string): void {
  db.pricingProfiles.push(
    {
      _id: "base-profile",
      adjustmentType: AdjustmentType.FIXED,
      adjustmentValueForAll: null,
      basedOn: null,
      incrementType: IncrementType.DECREASE,
      name: "Base Profile",
      selectionType: SelectionType.MULTIPLE,
      productAdjustments: [{ productId: product._id, adjustmentValue: 10 }],
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId,
    },
    {
      _id: "child-profile",
      adjustmentType: AdjustmentType.DYNAMIC,
      adjustmentValueForAll: 5,
      basedOn: "base-profile",
      incrementType: IncrementType.DECREASE,
      name: "Child Profile",
      selectionType: SelectionType.ALL,
      productAdjustments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId,
    },
  );
}
