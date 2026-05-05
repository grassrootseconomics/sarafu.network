import {
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber,
} from "libphonenumber-js";
import { z } from "zod";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "KE";

function tryParse(
  input: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY
): PhoneNumber | null {
  const cleaned = input.replace(/[^\d+]+/g, "");
  if (!cleaned) return null;

  const withDefault = parsePhoneNumberFromString(cleaned, defaultCountry);
  if (withDefault?.isValid()) return withDefault;

  if (!cleaned.startsWith("+")) {
    const asInternational = parsePhoneNumberFromString("+" + cleaned);
    if (asInternational?.isValid()) return asInternational;
  }

  return null;
}

export function normalizePhoneNumber(
  input: string,
  defaultCountry?: CountryCode
): string {
  const parsed = tryParse(input, defaultCountry);
  if (parsed) return parsed.number;
  return input.replace(/[^\d+]+/g, "");
}

export function isPhoneNumber(
  input: string,
  defaultCountry?: CountryCode
): boolean {
  return tryParse(input, defaultCountry) !== null;
}

export function getPhoneCountry(
  input: string,
  defaultCountry?: CountryCode
): CountryCode | undefined {
  return tryParse(input, defaultCountry)?.country;
}

export function formatPhoneInternational(
  input: string,
  defaultCountry?: CountryCode
): string {
  const parsed = tryParse(input, defaultCountry);
  return parsed?.formatInternational() ?? input;
}

export const makePhoneNumberSchema = (defaultCountry?: CountryCode) =>
  z
    .string()
    .trim()
    .refine((v) => isPhoneNumber(v, defaultCountry), {
      message: "Enter a valid phone number",
    })
    .transform((v) => normalizePhoneNumber(v, defaultCountry));
