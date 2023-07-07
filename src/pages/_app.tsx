// This example is based on the wagmi SIWE tutorial
// https://wagmi.sh/examples/sign-in-with-ethereum
import { Analytics } from "@vercel/analytics/react";
import { api } from "~/utils/api";

import "@rainbow-me/rainbowkit/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import Providers from "~/lib/providers";
import "../../styles/global.css";
import { Layout } from "../components/layout";

export interface MyAppProps extends AppProps {
  pageProps: object;
}

function App({ Component, ...props }: MyAppProps) {
  const { pageProps } = props;
  return (
    <>
      <Head>
        <title>Sarafu Network</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png?v=2"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png?v=2"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png?v=2"
        />
        <link rel="manifest" href="/site.webmanifest?v=2" />
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg?v=2"
          color="#5bbad5"
        />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <meta name="apple-mobile-web-app-title" content="Sarafu Network" />
        <meta name="application-name" content="Sarafu Network" />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Providers>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
      <Analytics />
    </>
  );
}

export default api.withTRPC(App);
