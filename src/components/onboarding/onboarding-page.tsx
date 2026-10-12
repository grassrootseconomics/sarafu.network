"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileStep } from "~/components/onboarding/steps/profile-step";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";

export function OnboardingPage() {
  const auth = useAuth();
  const router = useRouter();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (auth?.session?.user.onboarding_completed) {
      router.replace("/wallet");
    }
  }, [auth?.session?.user.onboarding_completed, router]);

  if (!auth?.session?.user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="size-10 text-primary" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight">
            Access your Sarafu account
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Connect the wallet for your existing Sarafu account.
          </p>
          <Button
            size="lg"
            onClick={openConnectModal}
            className="min-w-[200px]"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (auth.session.user.onboarding_completed) return null;

  return (
    <div className="flex min-h-[80vh] flex-col items-center px-4 py-12">
      <ProfileStep
        existingUser={auth.user}
        onComplete={() => router.replace("/wallet")}
      />
    </div>
  );
}
