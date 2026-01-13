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

  // Check conditions separately to prevent hydration mismatch
  // mounted is always false on server, so we use CSS visibility
  const shouldRenderNavBar = screen.isTablet && auth?.user;
  const isNavBarVisible = shouldRenderNavBar && mounted;

  return (
    <div
      className={cn(
        "relative w-full max-w-full pb-8 px-4 m-2 ml-0 mt-0 bg-background rounded-xl md:peer-data-[variant=inset]:shadow overflow-x-hidden min-h-[calc(100vh-85px)]",
        shouldRenderNavBar && "pb-[76px]",
        className
      )}
    >
      <div className="flex justify-end items-center">
        {/* <h1 className="text-2xl font-semibold">{title}</h1> */}
        {action}
      </div>
      {children}
      {shouldRenderNavBar && (
        <div className={isNavBarVisible ? "" : "invisible"}>
          <WalletNavBar />
        </div>
      )}
    </div>
  );
}
