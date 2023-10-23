import React from "react";
import { Toaster } from "~/components/ui/toaster";
import { useScreenType } from "~/hooks/useMediaQuery";
import { NavBar } from "../mobile-wallet/nav-bar";
import { MobileNavProvider } from "../mobile-wallet/provider";
import { SiteHeader } from "./site-header";
interface Props {
  children?: React.ReactNode;
}

export function Layout(props: Props) {
  return (
    <div className="relative flex flex-grow min-h-screen flex-col">
      <SiteHeader />
      {props.children}
      <Toaster />
    </div>
  );
}

export function MobileWalletLayout(props: Props) {
  const { isMobile, isTablet } = useScreenType();
  console.log("isMobile", isMobile);
  return (
    <div className="relative flex flex-grow min-h-screen flex-col">
      <MobileNavProvider>
        <SiteHeader />
        {props.children}
        <Toaster />
        {isTablet && <NavBar />}
      </MobileNavProvider>
    </div>
  );
}

export function BareLayout(props: Props) {
  return (
    <div className="relative flex flex-grow min-h-screen flex-col">
      {props.children}
      <Toaster />
    </div>
  );
}
