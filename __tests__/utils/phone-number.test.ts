import { describe, expect, it } from "vitest";
import { isPhoneNumber, normalizePhoneNumber } from "~/utils/phone-number";

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
  "lum@ge",
  "0x341"
]
describe("Normalize Functions", () => {
  cases.forEach(({ in: input, out: output }) => {
    it(`should normalize ${input} to ${output}`, () => {
      expect(normalizePhoneNumber(input)).toEqual(output);
    });
  });
});

describe("is PhoneNumber", () => {
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
