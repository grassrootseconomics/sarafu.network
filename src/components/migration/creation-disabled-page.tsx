"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { COSMO_LOCAL_CREDIT_URL, type CreationResource } from "~/lib/migration";
import { useCreationDisabled } from "./creation-disabled-provider";

export function CreationDisabledPage({
  resource,
  fallbackHref,
}: {
  resource: CreationResource;
  fallbackHref: string;
}) {
  const router = useRouter();
  const { openCreationDisabled } = useCreationDisabled();
  const returnToExistingContent = useCallback(() => {
    router.replace(fallbackHref);
  }, [fallbackHref, router]);

  useEffect(() => {
    openCreationDisabled(resource, { onClose: returnToExistingContent });
  }, [openCreationDisabled, resource, returnToExistingContent]);

  return (
    <div className="flex min-h-[60svh] items-center justify-center px-4 py-12">
      <div className="max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold text-[#004844]">
          New creation has moved
        </h1>
        <p className="text-muted-foreground">
          Use Cosmo-Local Credit for new accounts and content. Existing Sarafu
          content remains available here for now.
        </p>
        <Button asChild className="bg-[#004844] text-white hover:bg-[#003633]">
          <a
            href={COSMO_LOCAL_CREDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Cosmo-Local Credit
            <ArrowUpRight aria-hidden="true" className="ml-2 size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
