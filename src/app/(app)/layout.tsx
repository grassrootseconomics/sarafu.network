import { type Metadata } from "next/types";
import React from "react";
import { DefaultLayout } from "~/components/layout/default-layout";
import { Sidebar } from "~/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Sarafu Network",
  description:
    "The Sarafu Network is a decentralized social media platform built on the Celo blockchain.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

interface Props {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <>
      <Sidebar />
      <DefaultLayout>{children}</DefaultLayout>
    </>
  );
}
