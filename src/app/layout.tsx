import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";
import { headers } from "next/headers"; // added
import Script from "next/script";
import { type Metadata, type NextPage } from "next/types";
import { useEffect, type ReactElement, type ReactNode } from "react";
import { Toaster as Sonner } from "~/components/ui/sonner";
import ContextProvider from "~/context";
import { env } from "~/env";
import { fontPoppins, fontSans } from "~/lib/fonts";
import "../../styles/global.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export const metadata: Metadata = {
  title: "Sarafu Network",
  description:
    "The Sarafu Network is a decentralized social media platform built on the Celo blockchain.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get("cookie");
  useEffect(() => {
    if (!env.NEXT_PUBLIC_LOG_ROCKET_APP_ID) {
      return;
    }
    LogRocket.init(env.NEXT_PUBLIC_LOG_ROCKET_APP_ID);
    setupLogRocketReact(LogRocket);
  }, []);

  return (
    <html lang="en">
      <body
        className={`${fontPoppins.variable} ${fontSans.variable} font-sans `}
      >
        <Script
          data-website-id="530e771e-3248-42fa-b8b8-e14433a28ede"
          src="https://analytics.grassecon.net/kilifi"
        />
        <Script onLoad={() => {}} />
        <Sonner />
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
