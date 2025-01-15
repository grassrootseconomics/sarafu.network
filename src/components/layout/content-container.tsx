"use client";
import clsx from "clsx";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useScreenType } from "~/hooks/useMediaQuery";
import { WalletNavBar } from "./mobile-wallet-bar";

interface ContentContainerProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ContentContainer({ children, action }: ContentContainerProps) {
  const auth = useAuth();
  const mounted = useIsMounted();
  const screen = useScreenType();

  const shouldRenderNavBar = screen.isTablet && mounted && auth?.user;

  return (
    <div
      className={clsx(
        "relative container max-w-[100vw]",
        shouldRenderNavBar && "pb-[76px]"
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
