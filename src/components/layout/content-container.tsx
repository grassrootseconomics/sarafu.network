"use client";
import clsx from "clsx";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useScreenType } from "~/hooks/useMediaQuery";
import { WalletNavBar } from "./mobile-wallet-bar";

interface ContentContainerProps {
  title: string;
  Icon?: React.ElementType;
  children: React.ReactNode;
  animate?: boolean;
}

export function ContentContainer({ children }: ContentContainerProps) {
  const auth = useAuth();
  const mounted = useIsMounted();
  const screen = useScreenType();

  const shouldRenderNavBar = screen.isTablet && mounted && auth?.user;

  return (
    <div
      className={clsx("relative container", shouldRenderNavBar && "pb-[76px]")}
    >
      {children}
      {shouldRenderNavBar && <WalletNavBar />}
    </div>
  );
}
