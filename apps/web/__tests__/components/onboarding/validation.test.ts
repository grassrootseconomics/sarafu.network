import { describe, expect, it, vi } from "vitest";
import {
  validateWizardSteps,
  getFirstIncompleteStep,
} from "~/components/voucher/forms/create-offer-voucher-wizard/validation";
import { type OfferVoucherWizardData } from "~/components/voucher/forms/create-offer-voucher-wizard/schemas";

// shared-fields.ts imports VoucherIndex at module level
vi.mock("@sarafu/contracts", () => ({
  VoucherIndex: { exists: vi.fn().mockResolvedValue(false) },
}));

const validOffer: OfferVoucherWizardData["offer"] = {
  name: "Fresh Eggs",
  description: "Farm fresh eggs daily",
};

const validPricing: OfferVoucherWizardData["pricing"] = {
  currency: "KES",
  price: 100,
  unit: "dozen",
};

const validVoucher = {
  name: "Egg Voucher",
  shopDescription: "Redeemable for eggs",
  value: 50,
  uoa: "KES",
  symbol: "EGG",
  voucherType: "GIFTABLE" as const,
};

const validWizardData = {
  offer: validOffer,
  pricing: validPricing,
  voucher: validVoucher,
};

// ─── validateWizardSteps ──────────────────────────────────────────────

describe("validateWizardSteps", () => {
  it("returns all valid for complete valid data", () => {
    const results = validateWizardSteps(validWizardData);
    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    }
  });

  it("returns correct labels for each step", () => {
    const results = validateWizardSteps(validWizardData);
    expect(results.map((r) => r.label)).toEqual([
      "Create Your Offer",
      "Price Your Offer",
      "Your Voucher",
    ]);
  });

  it("marks step as invalid when data is missing", () => {
    const results = validateWizardSteps({ offer: validOffer });
    expect(results[0]?.isValid).toBe(true);
    expect(results[1]?.isValid).toBe(false);
    expect(results[1]?.errors).toContain(
      "This step has not been completed yet"
    );
    expect(results[2]?.isValid).toBe(false);
    expect(results[2]?.errors).toContain(
      "This step has not been completed yet"
    );
  });

  it("marks step as invalid when data fails validation", () => {
    const results = validateWizardSteps({
      ...validWizardData,
      offer: { name: "A", description: "" },
    });
    expect(results[0]?.isValid).toBe(false);
    expect(results[0]?.errors.length).toBeGreaterThan(0);
  });

  it("returns specific error messages from schema", () => {
    const results = validateWizardSteps({
      ...validWizardData,
      pricing: { currency: "", price: 0, unit: "" },
    });
    expect(results[1]?.isValid).toBe(false);
    expect(results[1]?.errors).toContain("Currency is required");
    expect(results[1]?.errors).toContain("Price must be greater than 0");
    expect(results[1]?.errors).toContain("Per-unit label is required");
  });

  it("handles completely empty data", () => {
    const results = validateWizardSteps({});
    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.isValid).toBe(false);
    }
  });
});

// ─── getFirstIncompleteStep ───────────────────────────────────────────

describe("getFirstIncompleteStep", () => {
  it("returns null when all steps are valid", () => {
    expect(getFirstIncompleteStep(validWizardData)).toBeNull();
  });

  it("returns 0 when offer is missing", () => {
    expect(
      getFirstIncompleteStep({ pricing: validPricing, voucher: validVoucher })
    ).toBe(0);
  });

  it("returns 1 when pricing is missing", () => {
    expect(
      getFirstIncompleteStep({ offer: validOffer, voucher: validVoucher })
    ).toBe(1);
  });

  it("returns 2 when voucher is missing", () => {
    expect(
      getFirstIncompleteStep({ offer: validOffer, pricing: validPricing })
    ).toBe(2);
  });

  it("returns 0 when all steps are missing", () => {
    expect(getFirstIncompleteStep({})).toBe(0);
  });

  it("returns first invalid even if later steps are valid", () => {
    expect(
      getFirstIncompleteStep({
        offer: { name: "A", description: "" },
        pricing: validPricing,
        voucher: validVoucher,
      })
    ).toBe(0);
  });
});
