"use client";

import React from "react";
import { Toaster as Sonner } from "~/components/ui/sonner";

import { useAuth } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useScreenType } from "~/hooks/useMediaQuery";
import { WalletNavBar } from "./mobile-wallet-bar";
import { SiteHeader } from "./site-header";
interface Props {
  children?: React.ReactNode;
}

export function LandingPageLayout(props: Props) {
  const { isTablet } = useScreenType();
  const auth = useAuth();
  const mounted = useIsMounted();
  const shouldRenderNavBar = isTablet && mounted && auth?.user;
  return (
    <div
      className={`relative flex flex-grow min-h-dvh flex-col ${
        shouldRenderNavBar ? "pb-[76px]" : ""
      } max-w-[100vw] overflow-x-hidden`}
    >
      <div className="absolute top-0 left-0 w-[100vw] min-h-[100vh] h-[100%] overflow-hidden -z-10 [&>*]:rounded-full [&>*]:absolute [&>*]:z-[-1]">
        <div className="bg-[#eef8f3] size-[40vw] top-[-400px] left-[-350px] "></div>
        <div className="bg-[#f8f6ee] size-[200px] top-[50%]    left-[10%] "></div>
        <div className="bg-[#f8eef1] size-[80px]  top-[40%]    left-[50%] "></div>
        <div className="bg-[#eef3f8] size-[800px] top-[70%]    left-[70%] "></div>
      </div>
      <SiteHeader />
      {props.children}
      <Sonner />
      {shouldRenderNavBar && <WalletNavBar />}
    </div>
  );
}
