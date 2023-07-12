import * as React from "react";
import { Toaster } from "~/components/ui/toaster";
import { SiteHeader } from "./site-header";
interface Props {
  children?: React.ReactNode;
}

export function Layout(props: Props) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{props.children}</div>
      <Toaster />
    </div>
  );
}
