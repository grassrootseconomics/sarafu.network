import { AppLayout } from "~/components/layout/app-layout";
import { OnboardingGuard } from "~/components/onboarding/onboarding-guard";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppLayout>
      <OnboardingGuard>{children}</OnboardingGuard>
    </AppLayout>
  );
}
