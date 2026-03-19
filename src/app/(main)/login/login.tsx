"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConnectors } from "wagmi";

import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { PaperWallet } from "~/utils/paper-wallet";

interface LoginProps {
  redirectPath?: string;
}

export function Login({ redirectPath = "/wallet" }: LoginProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(true);
  const isConnectingRef = useRef(false);
  const { openConnectModal } = useConnectModal();
  const connectors = useConnectors();
  const paperConnector = connectors.find(
    (connector) => connector.id === "paperConnector"
  );

  const user = useAuth();
  const isMounted = useIsMounted();

  const handleWalletParam = useCallback(
    async (wParam: string) => {
      if (isConnectingRef.current || !wParam) return;
      isConnectingRef.current = true;
      setIsConnecting(true);
      try {
        const paperWallet = new PaperWallet(wParam, sessionStorage);
        paperWallet.saveToStorage();

        if (!paperConnector) {
          console.error("Paper connector not found");
          return false;
        }

        await paperConnector.connect();
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.delete("w");
        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;
        router.replace(newUrl);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        openConnectModal?.();
      } catch (error) {
        console.error("Failed to process wallet parameter:", error);
      } finally {
        setIsConnecting(false);
      }
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const wParam = searchParams.get("w");
    if (wParam) void handleWalletParam(wParam);
  }, [searchParams, handleWalletParam]);

  useEffect(() => {
    if (user) router.push(redirectPath);
  }, [user, router, redirectPath]);

  const handleClick = useCallback(() => {
    if (user) router.push(redirectPath);
    else openConnectModal?.();
  }, [user, router, redirectPath, openConnectModal]);

  if (!isMounted) return null;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Connecting Wallet
        </h1>
        <p className="text-muted-foreground">
          Please wait while we establish a secure connection
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {isConnecting ? (
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        ) : (
          <Button variant="outline" onClick={handleClick} className="mt-4">
            {user ? "Go to Wallet" : "Connect"}
          </Button>
        )}
      </div>
    </div>
  );
}
