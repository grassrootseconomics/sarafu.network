import { type Metadata } from "next/types";
import { OnboardingPage as OnboardingClient } from "~/components/onboarding/onboarding-page";

export const metadata: Metadata = {
  title: "Welcome - Sarafu Network",
  description: "Set up your Sarafu Network account",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
