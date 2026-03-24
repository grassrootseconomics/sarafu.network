"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "~/components/loading";
import { useAuth } from "~/hooks/useAuth";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth?.session?.user && !auth.session.user.onboarding_completed) {
      router.push("/onboarding");
    }
  }, [auth?.session?.user, router]);

  // Don't block rendering for unauthenticated users (public pages)
  if (auth?.session?.user && !auth.session.user.onboarding_completed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return <>{children}</>;
}
