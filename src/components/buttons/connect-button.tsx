"use client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { cn } from "~/lib/utils";
import { Loading } from "../loading";
import { Button } from "../ui/button";

export const ConnectButton = ({ className }: { className?: string }) => {
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const user = useAuth();
  const isMounted = useIsMounted();
  const router = useRouter();
  const t = useTranslations("buttons");

  const isDisabled = !openConnectModal || !isMounted;
  const buttonText = user ? t("openWallet") : t("connectWallet");

  const handleClick = () => {
    if (user) {
      // Redirect to the user's wallet page using Next.js router
      void router.push("/wallet");
    } else {
      void openConnectModal?.();
    }
  };

  return (
    <Button
      className={cn("bg-gradient-to-r from-blue-500 to-blue-300", className)}
      disabled={user ? false : isDisabled}
      onClick={handleClick}
    >
      {connectModalOpen ? <Loading /> : buttonText}
    </Button>
  );
};
