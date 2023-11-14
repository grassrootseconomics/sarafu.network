import React from "react";
import { Toaster } from "~/components/ui/toaster";
import { useUser } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useScreenType } from "~/hooks/useMediaQuery";
import { NavBar } from "./mobile-wallet-bar";
import { SiteHeader } from "./site-header";
interface Props {
  children?: React.ReactNode;
}

export function Layout(props: Props) {
  const { isTablet } = useScreenType();
  const user = useUser();
  const mounted = useIsMounted();
  const shouldRenderNavBar = isTablet && mounted && user;
  return (
    <div
      className={`relative flex flex-grow min-h-screen flex-col ${
        shouldRenderNavBar ? "pb-[76px]" : ""
      }`}
    >
      <SiteHeader />
      {props.children}
      <Toaster />
      {shouldRenderNavBar && <NavBar />}
    </div>
  );
}
