import { type Metadata } from "next";
import { OnboardingPage as OnboardingClient } from "~/components/onboarding/onboarding-page";

export const metadata: Metadata = {
  title: "Complete Your Profile - Sarafu Network",
  description: "Complete the profile for your existing Sarafu account.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
