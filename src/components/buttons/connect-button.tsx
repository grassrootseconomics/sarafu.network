"use client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
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

  const isDisabled = !openConnectModal || !isMounted;
  const buttonText = user ? "Open Wallet" : "Connect Wallet";

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
      className={cn("bg-blue-500 hover:bg-blue-600", className)}
      disabled={user ? false : isDisabled}
      onClick={handleClick}
    >
      {connectModalOpen ? <Loading /> : buttonText}
    </Button>
  );
};
