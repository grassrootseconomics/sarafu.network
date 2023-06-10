// This example is based on the wagmi SIWE tutorial
// https://wagmi.sh/examples/sign-in-with-ethereum
import { CacheProvider, EmotionCache } from "@emotion/react";
import { Analytics } from "@vercel/analytics/react";

import { ThemeProvider } from "@mui/material/styles";
import {
  AuthenticationStatus,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  createAuthenticationAdapter,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiweMessage } from "siwe";
import { WagmiConfig } from "wagmi";
import { Layout } from "../src/components/Layout";
import createEmotionCache from "../src/lib/createEmotionCache";
import theme from "../src/lib/theme";
import { appInfo, chains, wagmiConfig } from "../src/lib/web3";
import "../styles/global.css";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const fetchingStatusRef = useRef(false);
  const verifyingRef = useRef(false);
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>("loading");

  // Fetch user when:
  useEffect(() => {
    const fetchStatus = async () => {
      if (fetchingStatusRef.current || verifyingRef.current) {
        return;
      }

      fetchingStatusRef.current = true;

      try {
        const response = await fetch("/api/me");
        const json = await response.json();
        setAuthStatus(json.address ? "authenticated" : "unauthenticated");
      } catch (_error) {
        setAuthStatus("unauthenticated");
      } finally {
        fetchingStatusRef.current = false;
      }
    };

    // 1. page loads
    fetchStatus();

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener("focus", fetchStatus);
    return () => window.removeEventListener("focus", fetchStatus);
  }, []);

  const authAdapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        const response = await fetch("/api/nonce");
        return await response.text();
      },

      createMessage: ({ nonce, address, chainId }) => {
        return new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in with Ethereum to the app.",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce,
        });
      },

      getMessageBody: ({ message }) => {
        return message.prepareMessage();
      },

      verify: async ({ message, signature }) => {
        verifyingRef.current = true;

        try {
          const response = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, signature }),
          });

          const authenticated = Boolean(response.ok);

          if (authenticated) {
            setAuthStatus(authenticated ? "authenticated" : "unauthenticated");
          }

          return authenticated;
        } catch (error) {
          return false;
        } finally {
          verifyingRef.current = false;
        }
      },

      signOut: async () => {
        setAuthStatus("unauthenticated");
        await fetch("/api/logout");
      },
    });
  }, []);

  return (
    <>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>Sarafu Network</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
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
        <ThemeProvider theme={theme}>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitAuthenticationProvider
              adapter={authAdapter}
              status={authStatus}
            >
              <RainbowKitProvider appInfo={appInfo} chains={chains}>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </RainbowKitProvider>
            </RainbowKitAuthenticationProvider>
          </WagmiConfig>
        </ThemeProvider>
      </CacheProvider>
      <Analytics />
    </>
  );
}
