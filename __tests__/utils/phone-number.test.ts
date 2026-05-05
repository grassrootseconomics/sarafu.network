import { describe, expect, it } from "vitest";
import {
  formatPhoneInternational,
  getPhoneCountry,
  isPhoneNumber,
  makePhoneNumberSchema,
  normalizePhoneNumber,
} from "~/utils/phone-number";

const cases = [
  { in: "+254 729 351 383", out: "+254729351383" },
  { in: "+254729351383", out: "+254729351383" },
  { in: "254 729 351 383", out: "+254729351383" },
  { in: "254729351383", out: "+254729351383" },
  { in: "0729351383", out: "+254729351383" },
];
const invalid = [
  "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "lum.sarafu.eth",
  "0x341",
  " ",
];

describe("Normalize Functions (Kenya default)", () => {
  cases.forEach(({ in: input, out: output }) => {
    it(`should normalize ${input} to ${output}`, () => {
      expect(normalizePhoneNumber(input)).toEqual(output);
    });
  });
});

describe("is PhoneNumber (Kenya default)", () => {
  cases.forEach(({ in: input }) => {
    it(`should be valid ${input}`, () => {
      expect(isPhoneNumber(input)).toEqual(true);
    });
  });
  invalid.forEach((input) => {
    it(`should be invalid ${input}`, () => {
      expect(isPhoneNumber(input)).toEqual(false);
    });
  });
});

describe("International country defaults", () => {
  it("normalizes a UK number with GB default", () => {
    expect(normalizePhoneNumber("07911 123456", "GB")).toEqual("+447911123456");
  });

  it("normalizes a fully international US number with no default", () => {
    expect(normalizePhoneNumber("+1 415 555 2671")).toEqual("+14155552671");
  });

  it("validates a UK number with GB default", () => {
    expect(isPhoneNumber("07911 123456", "GB")).toBe(true);
  });

  it("rejects a KE-formatted number under GB default", () => {
    expect(isPhoneNumber("0729351383", "GB")).toBe(false);
  });
});

describe("getPhoneCountry", () => {
  it("returns KE for a Kenya number", () => {
    expect(getPhoneCountry("+254729351383")).toBe("KE");
  });

  it("returns GB for a UK mobile in international form", () => {
    expect(getPhoneCountry("+44 7400 123456")).toBe("GB");
  });
});

describe("formatPhoneInternational", () => {
  it("formats a normalized E.164 number", () => {
    expect(formatPhoneInternational("+254729351383")).toBe("+254 729 351383");
  });
});

describe("makePhoneNumberSchema", () => {
  it("validates and normalizes with the supplied default country", () => {
    const schema = makePhoneNumberSchema("GB");
    expect(schema.parse("07911 123456")).toBe("+447911123456");
  });

  it("rejects invalid input", () => {
    const schema = makePhoneNumberSchema("KE");
    expect(() => schema.parse("not-a-phone")).toThrow();
  });
});
