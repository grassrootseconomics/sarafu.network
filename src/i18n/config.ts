import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This can either be defined statically at the top level or based on a parameter
  let locale = await requestLocale;

  // Ensure that a locale is set
  if (!locale || !locales.includes(locale as Locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});