import React from "react";

import { WalletNavBar } from "~/components/layout/mobile-wallet-bar";
import { SiteHeader } from "~/components/layout/site-header";

interface Props {
  children?: React.ReactNode;
}

export default function LandingPageLayout(props: Props) {
  return (
    <div
      className={`relative flex flex-grow min-h-dvh flex-col max-w-[100vw] overflow-x-hidden`}
    >
      <div className="absolute top-0 left-0 w-[100vw] min-h-[100vh] h-[100%] overflow-hidden -z-10 [&>*]:rounded-full [&>*]:absolute [&>*]:z-[-1]">
        <div className="bg-[#eef8f3] size-[40vw] top-[-400px] left-[-350px] "></div>
        <div className="bg-[#f8f6ee] size-[200px] top-[50%]    left-[10%] "></div>
        <div className="bg-[#f8eef1] size-[80px]  top-[40%]    left-[50%] "></div>
        <div className="bg-[#eef3f8] size-[800px] top-[70%]    left-[70%] "></div>
      </div>
      <SiteHeader />
      {props.children}
      <WalletNavBar />
    </div>
  );
}
