"use client";

import { ArrowUpRight, CircleAlert, Mail } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ResponsiveModal } from "~/components/responsive-modal";
import { Button } from "~/components/ui/button";
import {
  COSMO_LOCAL_CREDIT_URL,
  MIGRATION_DEADLINE,
  MIGRATION_SUPPORT_EMAIL,
  creationResources,
  type CreationResource,
} from "~/lib/migration";

interface OpenCreationDisabledOptions {
  onClose?: () => void;
}
interface CreationDisabledState {
  resource: CreationResource;
  onClose?: () => void;
}

interface CreationDisabledContextValue {
  openCreationDisabled: (
    resource: CreationResource,
    options?: OpenCreationDisabledOptions,
  ) => void;
}

const CreationDisabledContext =
  createContext<CreationDisabledContextValue | null>(null);

export function CreationDisabledProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreationDisabledState | null>(null);

  const openCreationDisabled = useCallback(
    (resource: CreationResource, options?: OpenCreationDisabledOptions) => {
      setState({ resource, onClose: options?.onClose });
    },
    [],
  );

  const close = useCallback(() => {
    const onClose = state?.onClose;
    setState(null);
    onClose?.();
  }, [state]);

  const value = useMemo(
    () => ({ openCreationDisabled }),
    [openCreationDisabled],
  );

  const resourceLabel = state ? creationResources[state.resource] : "items";

  return (
    <CreationDisabledContext.Provider value={value}>
      {children}
      <ResponsiveModal
        open={state !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        title={
          <span className="text-[#004844]">
            Create new {resourceLabel} on Cosmo-Local Credit
          </span>
        }
        description={`New ${resourceLabel} can no longer be created on Sarafu Network.`}
      >
        <div className="space-y-5 px-1 pb-2 pt-2">
          <div className="rounded-xl border border-[#FBDB99]/70 bg-[#004844] p-5 text-white">
            <div className="flex items-start gap-3">
              <CircleAlert
                aria-hidden="true"
                className="mt-0.5 size-6 shrink-0 text-[#FBDB99]"
              />
              <div className="space-y-2">
                <p className="font-semibold">
                  Sarafu Network is moving to Cosmo-Local Credit.
                </p>
                <p className="text-sm leading-6 text-white/90">
                  You can still access your existing Sarafu accounts and
                  content here for now. Create new {resourceLabel} on the
                  upgraded Cosmo-Local Credit app with Google sign-in, and
                  migrate by <strong>{MIGRATION_DEADLINE}</strong>.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            Historical Sarafu accounts, wallets, balances, vouchers, pools,
            reports, and obligations are not transferred automatically. If you
            need help migrating, contact {" "}
            <a
              className="font-semibold text-[#004844] underline underline-offset-2"
              href={`mailto:${MIGRATION_SUPPORT_EMAIL}`}
            >
              {MIGRATION_SUPPORT_EMAIL}
            </a>
            .
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={close}>
              Close
            </Button>
            <Button
              asChild
              className="bg-[#FBDB99] font-semibold text-[#004844] hover:bg-[#f7cc70]"
            >
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

          <a
            className="flex items-center justify-center gap-2 text-sm font-medium text-[#004844] sm:hidden"
            href={`mailto:${MIGRATION_SUPPORT_EMAIL}`}
          >
            <Mail aria-hidden="true" className="size-4" />
            Contact migration support
          </a>
        </div>
      </ResponsiveModal>
    </CreationDisabledContext.Provider>
  );
}

export function useCreationDisabled() {
  const context = useContext(CreationDisabledContext);
  if (!context) {
    throw new Error(
      "useCreationDisabled must be used within CreationDisabledProvider",
    );
  }
  return context;
}
