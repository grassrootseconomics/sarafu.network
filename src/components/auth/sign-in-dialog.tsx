"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, QrCode, Sparkles, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useConnectors } from "wagmi";
import { signInWithPaperWallet } from "~/lib/auth/paper-login";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { ResponsiveModal } from "../responsive-modal";

interface SignInDialogProps {
  triggerClassName?: string;
}

export function SignInDialog({ triggerClassName }: SignInDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const connectors = useConnectors();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const handleConnectWallet = () => {
    setOpen(false);
    openConnectModal?.();
  };

  const handlePaperLogin = () => {
    setOpen(false);
    // Defer to next tick so the modal finishes closing before any
    // downstream scan / password modal is opened.
    setTimeout(() => {
      void (async () => {
        try {
          await signInWithPaperWallet({
            queryClient,
            connectors,
            openConnectModal,
          });
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to connect with Paper Wallet";
          if (!message.toLowerCase().includes("cancel")) {
            console.error("Failed to connect with Paper Wallet", err);
            toast.error(message);
          }
        }
      })();
    }, 0);
  };

  const handleCreatePaperWallet = () => {
    setOpen(false);
    router.push("/paper/create");
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Sign in to Sarafu Network"
      description="Choose how you'd like to access your account."
      button={
        <Button
          variant="default"
          size="sm"
          className={cn(
            "rounded-full whitespace-nowrap border border-primary bg-primary text-primary-foreground hover:bg-primary/90",
            triggerClassName
          )}
        >
          Sign In
        </Button>
      }
    >
      <div className="flex flex-col gap-3 pt-2 pb-2 px-1">
        <OptionButton
          icon={<Wallet className="size-5" />}
          title="Connect Wallet"
          description="Use MetaMask, Rabby, WalletConnect or another wallet."
          onClick={handleConnectWallet}
        />
        <OptionButton
          icon={<QrCode className="size-5" />}
          title="Sign in with Paper Wallet"
          description="Scan or upload a paper wallet QR you've already saved."
          onClick={handlePaperLogin}
        />
        <OptionButton
          icon={<Sparkles className="size-5" />}
          title="Create a Paper Wallet"
          description="New here? Generate a paper wallet to back up offline."
          onClick={handleCreatePaperWallet}
        />
      </div>
    </ResponsiveModal>
  );
}

interface OptionButtonProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function OptionButton({
  icon,
  title,
  description,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold leading-none">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
