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

export class InvalidMsisdnError extends Error {
  constructor(input: string) {
    super(`Invalid Kenyan phone number: ${input}`);
    this.name = "InvalidMsisdnError";
  }
}

/**
 * Convert any Kenyan phone input into the local 10-digit form (`0XXXXXXXXX`)
 * required by the Pretium on-ramp upstream.
 */
export function toMsisdn(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("254")) local = "0" + local.slice(3);
  else if (!local.startsWith("0")) local = "0" + local;
  if (!/^0\d{9}$/.test(local)) throw new InvalidMsisdnError(phoneNumber);
  return local;
}
