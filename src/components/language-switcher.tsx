"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { locales, type Locale } from "~/i18n/config";

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.slice(`/${locale}`.length)
      : pathname;
    
    const newPath = newLocale === "en" 
      ? pathWithoutLocale || "/" 
      : `/${newLocale}${pathWithoutLocale || "/"}`;
    
    router.push(newPath);
  };

  if (locales.length <= 1) {
    return null; // Don't show switcher if only one language
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {localeNames[locale as Locale] || locale}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}