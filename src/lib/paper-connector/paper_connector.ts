import {
  createWalletClient,
  http,
  type Address,
  type LocalAccount,
  type ProviderConnectInfo,
} from "viem";
import { createConnector } from "wagmi";
import { PaperWallet } from "~/utils/paper-wallet";
import { getViemChain } from "../web3";
import { normalizeChainId } from "./utils";
const NO_KEY_ERROR = "No key";
const NO_ACCOUNT_ERROR = "No Account Found";

export interface PaperConnectorOptions {}

paperConnect.type = "paperConnect" as const;

export function paperConnect() {
  type NamespaceMethods =
    | "wallet_addEthereumChain"
    | "wallet_switchEthereumChain";
  type Properties = {
    connect(parameters?: { chainId?: number; pairingTopic?: string }): Promise<{
      accounts: readonly Address[];
      chainId: number;
    }>;
    getNamespaceChainsIds(): number[];
    getNamespaceMethods(): NamespaceMethods[];
    getRequestedChainsIds(): Promise<number[]>;
    isChainsStale(): Promise<boolean>;
    onConnect(connectInfo: ProviderConnectInfo): void;
    onDisplayUri(uri: string): void;
    onSessionDelete(data: { topic: string }): void;
    setRequestedChainsIds(chains: number[]): void;
    requestedChainsStorageKey: `${string}.requestedChains`;
  };
  type StorageItem = {
    [_ in Properties["requestedChainsStorageKey"]]: number[];
  };

  return createConnector<null, Properties, StorageItem>((config) => ({
    id: "paperConnect",
    name: "PaperConnect",
    type: paperConnect.type,
    requestedChainsStorageKey: `paperConnect.requestedChains`,
    async setup() {
      const provider = await this.getProvider().catch(() => null);
      if (!provider) return;
    },
    async isAuthorized() {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const wallet = PaperWallet.loadFromSessionStorage();
      return Boolean(wallet);
    },

    async connect() {
      const wallet = PaperWallet.loadFromSessionStorage();
      if (wallet)
        return {
          accounts: [wallet.getAddress()],
          chainId: getViemChain().id,
        };

      try {
        config.emitter.emit("message", { type: "connecting" });
        const wallet = await PaperWallet.fromQRCode();
        const address = wallet.getAddress();
        const data = {
          accounts: [address],
          chainId: getViemChain().id,
        };
        return data;
      } catch (error) {
        throw error;
      }
    },

    async getAccounts(): Promise<readonly Address[]> {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const address = PaperWallet.loadFromSessionStorage()?.getAddress();
      if (!address) throw new Error(NO_ACCOUNT_ERROR);
      const addresses = [address] as const;
      return addresses;
    },

    async getClient() {
      const accounts = await this.getAccounts();
      return createWalletClient({
        account: {
          address: accounts[0],
          source: "privateKey",
          publicKey: "0x000",
          type: "local",
          signMessage: async ({ message }) => {
            const wallet = PaperWallet.loadFromSessionStorage();
            if (!wallet) throw new Error(NO_KEY_ERROR);
            const account = await wallet.getAccount();
            const result = await account.signMessage({
              message: message,
            });
            return result;
          },
          signTransaction: async (transaction) => {
            const wallet = PaperWallet.loadFromSessionStorage();
            if (!wallet) throw new Error(NO_KEY_ERROR);
            const account = await wallet.getAccount();
            const result = await account.signTransaction(transaction);
            return result;
          },
          signTypedData: async (typedData) => {
            const wallet = PaperWallet.loadFromSessionStorage();
            if (!wallet) throw new Error(NO_KEY_ERROR);
            const account = await wallet.getAccount();
            const result = await account.signTypedData(typedData);
            return result;
          },
        } as LocalAccount<string, `0x${string}`>,
        chain: getViemChain(),
        transport: http(),
      });
    },

    async getProvider() {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return null;
    },

    onConnect: (_connectInfo: ProviderConnectInfo) => {
      // Implement your logic here
      console.log("onConnect");
    },

    getNamespaceChainsIds: (): number[] => {
      // Implement your logic here
      console.log("getNamespaceChainsIds");

      return [];
    },

    getNamespaceMethods: () => {
      // Implement your logic here
      console.log("getNamespaceMethods");

      return [];
    },

    async getRequestedChainsIds() {
      // Implement your logic here
      console.log("getRequestedChainsIds");
      return await this.getRequestedChainsIds();
    },

    onAccountsChanged: (accounts: string[]) => {
      console.log("onAccountsChanged", accounts);
      if (accounts.length === 0 || !accounts[0])
        config.emitter.emit("disconnect");
      else
        config.emitter.emit("change", {
          accounts: accounts as `0x${string}`[],
        });
      return;
    },

    onChainChanged(chainId: string | number): void {
      const id = normalizeChainId(chainId);
      config.emitter.emit("change", { chainId: id });
    },

    async getChainId(): Promise<number> {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return getViemChain().id;
    },

    onDisconnect: () => {
      PaperWallet.removeFromSessionStorage();
      config.emitter.emit("disconnect");
    },

    async disconnect(): Promise<void> {
      PaperWallet.removeFromSessionStorage();
      await new Promise((resolve) => setTimeout(resolve, 100));
      config.emitter.emit("disconnect");
    },
    isChainsStale: async () => {
      // Implement your logic here
      await new Promise((resolve) => setTimeout(resolve, 100));

      return false;
    },
    onDisplayUri(_uri: string): void {
      // Implement your logic here
    },
    onSessionDelete: (_data: { topic: string }) => {
      // Implement your logic here
    },
    setRequestedChainsIds(_chains: number[]): void {
      // Implement your logic here
    },
  }));
}
