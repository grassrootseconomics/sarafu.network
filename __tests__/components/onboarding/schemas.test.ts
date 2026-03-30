import { describe, expect, it, vi } from "vitest";
import { OnboardingProfileFormSchema } from "~/components/users/schemas";
import { offerSchema } from "~/components/voucher/forms/create-offer-voucher-wizard/schemas/offer";
import { pricingSchema } from "~/components/voucher/forms/create-offer-voucher-wizard/schemas/pricing";
import { voucherStepSchemaSync } from "~/components/voucher/forms/create-offer-voucher-wizard/schemas/voucher";
import { confirmSchema } from "~/components/voucher/forms/create-offer-voucher-wizard/schemas/confirm";

// shared-fields.ts imports VoucherIndex at module level
vi.mock("~/contracts", () => ({
  VoucherIndex: { exists: vi.fn().mockResolvedValue(false) },
}));

// ─── OnboardingProfileFormSchema ──────────────────────────────────────

describe("OnboardingProfileFormSchema", () => {
  const validProfile = {
    given_names: "Alice",
    family_name: "Smith",
    email: "alice@example.com",
    date_of_birth: new Date("1990-06-15"),
    location_name: "Nairobi",
    geo: { x: 36.8, y: -1.3 },
    bio: "Hello world",
    profile_photo_url: "https://example.com/photo.jpg",
  };

  it("accepts a valid complete profile", () => {
    const result = OnboardingProfileFormSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("accepts minimal valid profile with nullable optionals", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      given_names: "A",
      family_name: "B",
      email: "a@b.co",
      date_of_birth: new Date("2000-01-01"),
      location_name: "X",
      geo: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty given_names", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      given_names: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name is required");
    }
  });

  it("rejects empty family_name", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      family_name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Family name is required");
    }
  });

  it("rejects invalid email format", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Invalid email address");
    }
  });

  it("rejects missing email", () => {
    const { email: _, ...noEmail } = validProfile;
    const result = OnboardingProfileFormSchema.safeParse(noEmail);
    expect(result.success).toBe(false);
  });

  it("rejects future date_of_birth", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      date_of_birth: new Date("2099-01-01"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Date of birth cannot be in the future");
    }
  });

  it("rejects date_of_birth before 1900", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      date_of_birth: new Date("1899-12-31"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Please enter a valid birth year");
    }
  });

  it("accepts date_of_birth exactly in 1900", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      date_of_birth: new Date("1900-01-01"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts null geo", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      geo: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null bio", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      bio: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null profile_photo_url", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      profile_photo_url: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid profile_photo_url", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      profile_photo_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string date_of_birth to Date", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      date_of_birth: "1990-06-15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date_of_birth).toBeInstanceOf(Date);
    }
  });

  it("trims whitespace from given_names", () => {
    const result = OnboardingProfileFormSchema.safeParse({
      ...validProfile,
      given_names: "  Alice  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.given_names).toBe("Alice");
    }
  });
});

// ─── offerSchema ──────────────────────────────────────────────────────

describe("offerSchema", () => {
  const validOffer = {
    name: "Fresh Eggs",
    description: "Farm fresh eggs daily",
  };

  it("accepts a valid offer", () => {
    expect(offerSchema.safeParse(validOffer).success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = offerSchema.safeParse({ ...validOffer, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Offer name is required");
    }
  });

  it("rejects name shorter than 2 chars", () => {
    const result = offerSchema.safeParse({ ...validOffer, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 32 chars", () => {
    const result = offerSchema.safeParse({
      ...validOffer,
      name: "A".repeat(33),
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at minimum boundary (2 chars)", () => {
    expect(
      offerSchema.safeParse({ ...validOffer, name: "AB" }).success
    ).toBe(true);
  });

  it("accepts name at maximum boundary (32 chars)", () => {
    expect(
      offerSchema.safeParse({ ...validOffer, name: "A".repeat(32) }).success
    ).toBe(true);
  });

  it("rejects empty description", () => {
    const result = offerSchema.safeParse({ ...validOffer, description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 3 chars", () => {
    const result = offerSchema.safeParse({ ...validOffer, description: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 256 chars", () => {
    const result = offerSchema.safeParse({
      ...validOffer,
      description: "A".repeat(257),
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional categories", () => {
    const result = offerSchema.safeParse({
      ...validOffer,
      categories: ["food", "organic"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing categories", () => {
    expect(offerSchema.safeParse(validOffer).success).toBe(true);
  });

  it("accepts optional photo", () => {
    const result = offerSchema.safeParse({
      ...validOffer,
      photo: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing photo", () => {
    expect(offerSchema.safeParse(validOffer).success).toBe(true);
  });

  it("trims whitespace from name and description", () => {
    const result = offerSchema.safeParse({
      name: "  Eggs  ",
      description: "  Fresh  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Eggs");
      expect(result.data.description).toBe("Fresh");
    }
  });
});

// ─── pricingSchema ────────────────────────────────────────────────────

describe("pricingSchema", () => {
  const validPricing = {
    currency: "KES",
    price: 100,
    unit: "dozen",
  };

  it("accepts valid pricing", () => {
    expect(pricingSchema.safeParse(validPricing).success).toBe(true);
  });

  it("accepts full pricing with optional fields", () => {
    const result = pricingSchema.safeParse({
      ...validPricing,
      quantity: 10,
      frequency: "week",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty currency", () => {
    const result = pricingSchema.safeParse({ ...validPricing, currency: "" });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = pricingSchema.safeParse({ ...validPricing, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = pricingSchema.safeParse({ ...validPricing, price: -5 });
    expect(result.success).toBe(false);
  });

  it("coerces string price to number", () => {
    const result = pricingSchema.safeParse({ ...validPricing, price: "100" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(100);
    }
  });

  it("rejects empty unit", () => {
    const result = pricingSchema.safeParse({ ...validPricing, unit: "" });
    expect(result.success).toBe(false);
  });

  it("rejects unit longer than 32 chars", () => {
    const result = pricingSchema.safeParse({
      ...validPricing,
      unit: "A".repeat(33),
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = pricingSchema.safeParse({
      ...validPricing,
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero quantity", () => {
    const result = pricingSchema.safeParse({
      ...validPricing,
      quantity: 0,
    });
    expect(result.success).toBe(true);
  });

  it.each(["day", "week", "month", "year"] as const)(
    "accepts frequency '%s'",
    (freq) => {
      const result = pricingSchema.safeParse({
        ...validPricing,
        frequency: freq,
      });
      expect(result.success).toBe(true);
    }
  );

  it("rejects invalid frequency", () => {
    const result = pricingSchema.safeParse({
      ...validPricing,
      frequency: "hourly",
    });
    expect(result.success).toBe(false);
  });

  it("accepts missing optional fields", () => {
    expect(pricingSchema.safeParse(validPricing).success).toBe(true);
  });
});

// ─── voucherStepSchemaSync ────────────────────────────────────────────

describe("voucherStepSchemaSync", () => {
  const baseVoucher = {
    name: "Test Voucher",
    shopDescription: "A test voucher for testing",
    value: 100,
    uoa: "KES",
    symbol: "TEST",
    voucherType: "GIFTABLE" as const,
  };

  it("accepts a valid GIFTABLE voucher", () => {
    expect(voucherStepSchemaSync.safeParse(baseVoucher).success).toBe(true);
  });

  it("rejects name shorter than 3 chars", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      name: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 32 chars", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      name: "A".repeat(33),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty shopDescription", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      shopDescription: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects shopDescription shorter than 3 chars", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      shopDescription: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects shopDescription longer than 256 chars", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      shopDescription: "A".repeat(257),
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero value", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      value: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer value", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      value: 10.5,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string value to number", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      value: "100",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(100);
    }
  });

  it("rejects empty uoa", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      uoa: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty symbol", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      symbol: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects symbol longer than 6 chars", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      symbol: "TOOLONG",
    });
    expect(result.success).toBe(false);
  });

  it("uppercases symbol", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      symbol: "abc",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.symbol).toBe("ABC");
    }
  });

  // Conditional: GIFTABLE_EXPIRING
  it("GIFTABLE_EXPIRING requires expirationDate", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      voucherType: "GIFTABLE_EXPIRING",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Expiration date is required");
    }
  });

  it("GIFTABLE_EXPIRING accepts valid expirationDate", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      voucherType: "GIFTABLE_EXPIRING",
      expirationDate: new Date("2027-01-01"),
    });
    expect(result.success).toBe(true);
  });

  // Conditional: DEMURRAGE
  const validDemurrage = {
    ...baseVoucher,
    voucherType: "DEMURRAGE" as const,
    demurrageRate: 2,
    demurragePeriod: 43800,
    communityFund: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B",
  };

  it("DEMURRAGE accepts valid complete data", () => {
    expect(voucherStepSchemaSync.safeParse(validDemurrage).success).toBe(true);
  });

  it("DEMURRAGE requires demurrageRate", () => {
    const { demurrageRate: _, ...noDemurrageRate } = validDemurrage;
    const result = voucherStepSchemaSync.safeParse(noDemurrageRate);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Demurrage rate is required");
    }
  });

  it("DEMURRAGE requires demurragePeriod", () => {
    const { demurragePeriod: _, ...noPeriod } = validDemurrage;
    const result = voucherStepSchemaSync.safeParse(noPeriod);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Period is required");
    }
  });

  it("DEMURRAGE requires communityFund", () => {
    const { communityFund: _, ...noFund } = validDemurrage;
    const result = voucherStepSchemaSync.safeParse(noFund);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Community fund address is required");
    }
  });

  it("DEMURRAGE rejects invalid communityFund address", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...validDemurrage,
      communityFund: "not-an-address",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Invalid address format");
    }
  });

  it("DEMURRAGE rejects rate >= 100", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...validDemurrage,
      demurrageRate: 100,
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional geo, supply, contactEmail, location", () => {
    const result = voucherStepSchemaSync.safeParse({
      ...baseVoucher,
      geo: { x: 1, y: 2 },
      supply: 5000,
      contactEmail: "test@example.com",
      location: "Mombasa",
    });
    expect(result.success).toBe(true);
  });
});

// ─── confirmSchema ────────────────────────────────────────────────────

describe("confirmSchema", () => {
  it("accepts both true", () => {
    const result = confirmSchema.safeParse({
      pathLicense: true,
      termsAndConditions: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects pathLicense false", () => {
    const result = confirmSchema.safeParse({
      pathLicense: false,
      termsAndConditions: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("You must accept the PATH license");
    }
  });

  it("rejects termsAndConditions false", () => {
    const result = confirmSchema.safeParse({
      pathLicense: true,
      termsAndConditions: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("You must accept the terms and conditions");
    }
  });

  it("rejects both false", () => {
    const result = confirmSchema.safeParse({
      pathLicense: false,
      termsAndConditions: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(2);
    }
  });
});
