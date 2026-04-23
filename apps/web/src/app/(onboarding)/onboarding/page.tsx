import { headers } from "next/headers";
import { type Metadata } from "next/types";
import { OnboardingPage as OnboardingClient } from "~/components/onboarding/onboarding-page";
import { getDefaultCurrencyForCountry } from "@sarafu/core/currencies";

export const metadata: Metadata = {
  title: "Welcome - Sarafu Network",
  description: "Set up your Sarafu Network account",
};

export default async function OnboardingPage() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country");
  const defaultCurrency = getDefaultCurrencyForCountry(country);
  return <OnboardingClient defaultCurrency={defaultCurrency} />;
}
