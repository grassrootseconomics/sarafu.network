import { type CountryCode, getCountries } from "libphonenumber-js";
import { useGeoCountry } from "~/context/geo";
import { useAuth } from "~/hooks/use-auth";
import { DEFAULT_PHONE_COUNTRY, getPhoneCountry } from "~/utils/phone-number";

const SUPPORTED_COUNTRIES = new Set<string>(getCountries());

function fromBrowserLocale(): CountryCode | undefined {
  if (typeof navigator === "undefined" || !navigator.language) return undefined;
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    if (region && SUPPORTED_COUNTRIES.has(region)) return region as CountryCode;
  } catch {
    // ignore
  }
  return undefined;
}

export function useDefaultPhoneCountry(): CountryCode {
  const auth = useAuth();
  const geo = useGeoCountry();

  const existingPhone = auth?.user?.phone_number;
  if (existingPhone) {
    const fromExistingPhone = getPhoneCountry(existingPhone);
    if (fromExistingPhone) return fromExistingPhone;
  }

  if (geo) {
    const upper = geo.toUpperCase();
    if (SUPPORTED_COUNTRIES.has(upper)) return upper as CountryCode;
  }

  const locale = fromBrowserLocale();
  if (locale) return locale;

  return DEFAULT_PHONE_COUNTRY;
}
