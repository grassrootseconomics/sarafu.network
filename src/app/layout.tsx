import { headers } from "next/headers"; // added
import Script from "next/script";
import { type Metadata } from "next/types";
import { AppLayout } from "~/components/layout/app-layout";
import { Toaster as Sonner } from "~/components/ui/sonner";
import ContextProvider from "~/context";
import { fontPoppins, fontSans } from "~/lib/fonts";
import "../../styles/global.css";

export const metadata: Metadata = {
  title: "Sarafu Network",
  description:
    "The Sarafu Network is a decentralized social media platform built on the Celo blockchain.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
      </head>
      <body
        className={`${fontPoppins.variable} ${fontSans.variable} font-sans  bg-gradient-to-br from-background to-[#FBDB99]/20 `}
      >
        <Script
          data-website-id="530e771e-3248-42fa-b8b8-e14433a28ede"
          src="https://analytics.grassecon.net/kilifi"
        />
        <Sonner />
        <ContextProvider cookies={cookies}>
          <AppLayout>{children}</AppLayout>
        </ContextProvider>
      </body>
    </html>
  );
}
