import { type QueryClient } from "@tanstack/react-query";
import {
  connect,
  disconnect,
  getAccount,
  signMessage,
  type Connector,
} from "@wagmi/core";
import { createSiweAdapter } from "~/config/siwe";
import { config } from "~/config/wagmi.config.client";

interface SignInWithPaperWalletParams {
  queryClient: QueryClient;
  connectors: readonly Connector[];
  openConnectModal?: () => void;
}

export async function signInWithPaperWallet({
  queryClient,
  connectors,
  openConnectModal,
}: SignInWithPaperWalletParams): Promise<void> {
  const paperConnector = connectors.find(
    (connector) => connector.id === "paperConnector"
  );

  if (!paperConnector) {
    openConnectModal?.();
    return;
  }

  let accountAddress: `0x${string}` | undefined;
  let chainId: number | undefined;
  const activeAccount = getAccount(config);

  if (activeAccount.status === "connected") {
    if (activeAccount.connector?.id !== paperConnector.id) {
      await disconnect(config);
      const connection = await connect(config, {
        connector: paperConnector,
      });
      const firstAccount = connection.accounts[0] as
        | `0x${string}`
        | { address: `0x${string}` }
        | undefined;
      accountAddress =
        typeof firstAccount === "string"
          ? firstAccount
          : firstAccount?.address;
      chainId = connection.chainId;
    } else {
      accountAddress = activeAccount.address;
      chainId = activeAccount.chainId;
    }
  } else {
    const connection = await connect(config, { connector: paperConnector });
    const firstAccount = connection.accounts[0] as
      | `0x${string}`
      | { address: `0x${string}` }
      | undefined;
    accountAddress =
      typeof firstAccount === "string" ? firstAccount : firstAccount?.address;
    chainId = connection.chainId;
  }

  if (!accountAddress || !chainId) {
    throw new Error("Paper Wallet connected but no account was found");
  }

  const siweAdapter = createSiweAdapter(queryClient);
  const nonce = await siweAdapter.getNonce();
  const message = siweAdapter.createMessage({
    address: accountAddress,
    chainId,
    nonce,
  });

  const signature = await signMessage(config, { message });

  const isVerified = await siweAdapter.verify({ message, signature });
  if (!isVerified) {
    throw new Error("Authentication failed");
  }
}
