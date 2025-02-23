"use client";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useScreenType } from "~/hooks/useMediaQuery";
import { cn } from "~/lib/utils";
import { WalletNavBar } from "./mobile-wallet-bar";

interface ContentContainerProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ContentContainer({
  children,
  action,
  className,
}: ContentContainerProps) {
  const auth = useAuth();
  const mounted = useIsMounted();
  const screen = useScreenType();

  const shouldRenderNavBar = screen.isTablet && mounted && auth?.user;

  return (
    <div
      className={cn(
        "relative container max-w-[100vw]",
        shouldRenderNavBar && "pb-[76px]",
        className
      )}
    >
      <div className="flex justify-end items-center">
        {/* <h1 className="text-2xl font-semibold">{title}</h1> */}
        {action}
      </div>
      {children}
      {shouldRenderNavBar && <WalletNavBar />}
    </div>
  );
}
