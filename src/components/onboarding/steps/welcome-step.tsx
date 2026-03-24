"use client";

import { ArrowRight, PartyPopper, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

interface WelcomeStepProps {
  givenNames: string;
}

export function WelcomeStep({ givenNames }: WelcomeStepProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <PartyPopper className="size-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Sarafu Network{givenNames ? `, ${givenNames}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Your account is all set up. Start by creating your first community
          voucher to begin trading with your community.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full text-base"
          onClick={() => router.push("/vouchers/create")}
        >
          Create your first voucher
          <ArrowRight className="ml-2 size-5" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-muted-foreground"
          onClick={() => router.push("/wallet")}
        >
          <SkipForward className="mr-2 size-4" />
          Skip for now
        </Button>
      </div>
    </div>
  );
}
