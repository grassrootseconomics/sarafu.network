import { headers } from "next/headers"; // added
import Script from "next/script";
import { type Metadata } from "next/types";
import Sidebar from "~/components/layout/sidebar";
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
        {(process.env.NODE_ENV === "development" ||
          process.env.VERCEL_ENV === "preview") && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            data-recording-token="fgfmV6pTlYg189SHj046diDyJAEthqm2TrWQYJEG"
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
      </head>
      <body
        className={`${fontPoppins.variable} ${fontSans.variable} font-sans `}
      >
        <Script
          data-website-id="530e771e-3248-42fa-b8b8-e14433a28ede"
          src="https://analytics.grassecon.net/kilifi"
        />
        <Sonner />
        <ContextProvider cookies={cookies}>
          <Sidebar>{children}</Sidebar>
        </ContextProvider>
      </body>
    </html>
  );
}
