import React from "react";

import { WalletNavBar } from "~/components/layout/mobile-wallet-bar";
import Sidebar from "~/components/layout/sidebar-2";
import { SiteHeader } from "~/components/layout/site-header";

interface Props {
  children?: React.ReactNode;
}

export default function LandingPageLayout(props: Props) {
  return (
    <Sidebar>{props.children}</Sidebar>

  );
}
