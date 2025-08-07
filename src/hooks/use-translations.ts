import { useTranslations } from "next-intl";

export function useCommonTranslations() {
  return useTranslations("common");
}

export function useButtonTranslations() {
  return useTranslations("buttons");
}

export function useNavigationTranslations() {
  return useTranslations("navigation");
}

export function useDashboardTranslations() {
  return useTranslations("dashboard");
}

export function useFormTranslations() {
  return useTranslations("forms");
}

export function useErrorTranslations() {
  return useTranslations("errors");
}

export function useSuccessTranslations() {
  return useTranslations("success");
}