import { describe, expect, it, vi } from "vitest";
import { transformToDeployInput } from "~/components/voucher/forms/create-offer-voucher-wizard/transform";
import { type OfferVoucherWizardData } from "~/components/voucher/forms/create-offer-voucher-wizard/schemas";
import { VoucherType } from "@sarafu/core/enums";

// shared-fields.ts imports VoucherIndex at module level
vi.mock("@sarafu/contracts", () => ({
  VoucherIndex: { exists: vi.fn().mockResolvedValue(false) },
}));

const mockUser = {
  role: "USER" as const,
  given_names: "Alice",
  family_name: "Smith",
  gender: null,
  year_of_birth: 1990,
  location_name: "Nairobi",
  geo: { x: 36.8, y: -1.3 },
  email: "alice@example.com",
  date_of_birth: "1990-06-15",
  bio: "Hello",
  profile_photo_url: null,
  default_voucher: "0x1234567890123456789012345678901234567890",
  onboarding_completed: true,
};

const baseWizardData: OfferVoucherWizardData = {
  offer: {
    name: "Fresh Eggs",
    description: "Farm fresh eggs daily",
    categories: ["food"],
    photo: "https://example.com/eggs.jpg",
  },
  pricing: {
    currency: "KES",
    price: 100,
    unit: "dozen",
    quantity: 10,
    frequency: "week",
  },
  voucher: {
    name: "Egg Voucher",
    shopDescription: "Redeemable for eggs",
    value: 50,
    uoa: "KES",
    symbol: "EGG",
    voucherType: VoucherType.GIFTABLE,
    contactEmail: "voucher@test.com",
    location: "Mombasa",
    geo: { x: 39.7, y: -4.0 },
    supply: 5000,
  },
  confirm: {
    termsAndConditions: true,
    pathLicense: true,
  },
};

describe("transformToDeployInput", () => {
  // ── Expiration mapping ────────────────────────────────────────────

  it("maps GIFTABLE voucher correctly", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.expiration).toEqual({ type: VoucherType.GIFTABLE });
  });

  it("maps GIFTABLE_EXPIRING voucher correctly", () => {
    const expirationDate = new Date("2027-01-01");
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      voucher: {
        ...baseWizardData.voucher,
        voucherType: VoucherType.GIFTABLE_EXPIRING,
        expirationDate,
      },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.expiration).toEqual({
      type: VoucherType.GIFTABLE_EXPIRING,
      expirationDate,
    });
  });

  it("maps DEMURRAGE voucher correctly", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      voucher: {
        ...baseWizardData.voucher,
        voucherType: VoucherType.DEMURRAGE,
        demurrageRate: 2,
        demurragePeriod: 43800,
        communityFund: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
      },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.expiration).toEqual({
      type: VoucherType.DEMURRAGE,
      rate: 2,
      period: 43800,
      communityFund: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
    });
  });

  // ── Product mapping ───────────────────────────────────────────────

  it("maps offer data into products array", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.products).toHaveLength(1);
    expect(result.products[0]?.name).toBe("Fresh Eggs");
    expect(result.products[0]?.description).toBe("Farm fresh eggs daily");
  });

  it("maps pricing data into products array", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.products[0]?.price).toBe(100);
    expect(result.products[0]?.unit).toBe("dozen");
    expect(result.products[0]?.quantity).toBe(10);
    expect(result.products[0]?.frequency).toBe("week");
  });

  it("maps offer categories and photo", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.products[0]?.categories).toEqual(["food"]);
    expect(result.products[0]?.image_url).toBe("https://example.com/eggs.jpg");
  });

  // ── Email fallback chain ──────────────────────────────────────────

  it("uses voucher.contactEmail when present", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.email).toBe("voucher@test.com");
  });

  it("falls back to user.email when contactEmail is empty", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      voucher: { ...baseWizardData.voucher, contactEmail: "" },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.email).toBe("alice@example.com");
  });

  it("falls back to empty string when both emails are empty", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      voucher: { ...baseWizardData.voucher, contactEmail: "" },
    };
    const user = { ...mockUser, email: null };
    const result = transformToDeployInput(data, user);
    expect(result.email).toBe("");
  });

  // ── Geo fallback chain ────────────────────────────────────────────

  it("uses voucher.geo when present", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.geo).toEqual({ x: 39.7, y: -4.0 });
  });

  it("falls back to user.geo when voucher.geo is undefined", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      voucher: { ...baseWizardData.voucher, geo: undefined },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.geo).toEqual({ x: 36.8, y: -1.3 });
  });

  // ── Location fallback chain ───────────────────────────────────────

  it("uses voucher.location when present", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.location).toBe("Mombasa");
  });

  it("falls back to user.location_name when voucher.location is undefined", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      voucher: { ...baseWizardData.voucher, location: undefined },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.location).toBe("Nairobi");
  });

  // ── Defaults ──────────────────────────────────────────────────────

  it("uses default supply of 1000 when supply is undefined", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      voucher: { ...baseWizardData.voucher, supply: undefined },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.supply).toBe(1000);
  });

  it("uses explicit supply when provided", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.supply).toBe(5000);
  });

  it("defaults quantity to 0 when undefined", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      pricing: { ...baseWizardData.pricing, quantity: undefined },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.products[0]?.quantity).toBe(0);
  });

  it("defaults frequency to 'day' when undefined", () => {
    const data: OfferVoucherWizardData = {
      ...baseWizardData,
      pricing: { ...baseWizardData.pricing, frequency: undefined },
    };
    const result = transformToDeployInput(data, mockUser);
    expect(result.products[0]?.frequency).toBe("day");
  });

  // ── Consent fields ────────────────────────────────────────────────

  it("maps consent fields correctly", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.termsAndConditions).toBe(true);
    expect(result.pathLicense).toBe(true);
  });

  // ── Core field mapping ────────────────────────────────────────────

  it("maps voucher name, description, symbol, value, uoa", () => {
    const result = transformToDeployInput(baseWizardData, mockUser);
    expect(result.name).toBe("Egg Voucher");
    expect(result.description).toBe("Redeemable for eggs");
    expect(result.symbol).toBe("EGG");
    expect(result.value).toBe(50);
    expect(result.uoa).toBe("KES");
  });
});
