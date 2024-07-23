import React from "react";
import { Toaster as Sonner } from "~/components/ui/sonner";

import { useSidebarToggle } from "~/hooks/use-sidebar-toggle";
import { useStore } from "~/hooks/use-store";
import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useScreenType } from "~/hooks/useMediaQuery";
import { cn } from "~/lib/utils";
import { WalletNavBar } from "./mobile-wallet-bar";
import { Sidebar } from "./sidebar";
interface Props {
  children?: React.ReactNode;
}

export function DefaultLayout(props: Props) {
  const { isTablet } = useScreenType();
  const auth = useAuth();
  const mounted = useIsMounted();
  const shouldRenderNavBar = isTablet && mounted && auth?.user;
  const sidebar = useStore(useSidebarToggle, (state) => state);

  return (
    <div
      className={cn(
        "min-h-[calc(100vh_-_56px)]  transition-[margin-left] ease-in-out duration-300",
        sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
        shouldRenderNavBar ? "pb-[76px]" : ""
      )}
    >
      <Sidebar />
      {props.children}
      <Sonner />
      {shouldRenderNavBar && <WalletNavBar />}
    </div>
  );
}
