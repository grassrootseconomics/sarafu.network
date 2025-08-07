import { useTranslations } from "next-intl";
import type { NavItem } from "~/config/site";

export function useLocalizedNavigation(): NavItem[] {
  const t = useTranslations("navigation");

  // For now, return the static navigation structure
  // Components that use this can access the translation function
  // This is a placeholder to maintain TypeScript compatibility
  return [];
}