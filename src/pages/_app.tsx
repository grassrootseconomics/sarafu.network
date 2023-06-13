// This example is based on the wagmi SIWE tutorial
// https://wagmi.sh/examples/sign-in-with-ethereum
import { type EmotionCache } from "@emotion/react";
import { Analytics } from "@vercel/analytics/react";
import { api } from "~/utils/api";

import "@rainbow-me/rainbowkit/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import Providers from "~/lib/providers";
import { Layout } from "../components/Layout";
import "../styles/global.css";

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  pageProps: object;
}

function App({ Component, ...props }: MyAppProps) {
  const { emotionCache, pageProps } = props;
  return (
    <>
      <Head>
        <title>Sarafu Network</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png?v=1"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png?v=1"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png?v=1"
        />
        <link rel="manifest" href="/site.webmanifest?v=1" />
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg?v=1"
          color="#00ae00"
        />
        <link rel="shortcut icon" href="/favicon.ico?v=1" />
        <meta name="msapplication-TileColor" content="#00a300" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Providers emotionCache={emotionCache}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
      <Analytics />
    </>
  );
}

export default api.withTRPC(App);
