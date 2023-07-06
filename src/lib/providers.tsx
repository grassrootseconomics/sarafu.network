/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// This example is based on the wagmi SIWE tutorial
// https://wagmi.sh/examples/sign-in-with-ethereum
import { CacheProvider, type EmotionCache } from "@emotion/react";

import { ThemeProvider } from "@mui/material/styles";
import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { WagmiConfig } from "wagmi";
import { useAuth } from "~/hooks/useAuth";
import createEmotionCache from "../lib/createEmotionCache";
import theme from "../lib/theme";
import { appInfo, chains, wagmiConfig } from "../lib/web3";
// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function Providers({
  children,
  emotionCache = clientSideEmotionCache,
}: {
  emotionCache?: EmotionCache;
  children: React.ReactNode;
}) {
  // const { emotionCache = clientSideEmotionCache } = props;
  const { adapter, status } = useAuth();
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
            <RainbowKitProvider appInfo={appInfo} chains={chains}>
              {children}
            </RainbowKitProvider>
          </RainbowKitAuthenticationProvider>
        </WagmiConfig>
      </ThemeProvider>
    </CacheProvider>
  );
}
