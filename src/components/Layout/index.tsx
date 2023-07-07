import * as React from "react";
import { SiteHeader } from "./SiteHeader";

interface Props {
  children?: React.ReactNode;
}

export function Layout(props: Props) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{props.children}</div>
    </div>
  );
}
