import {
  createWalletClient,
  type Address,
  type LocalAccount,
  type ProviderConnectInfo,
} from "viem";
import { createConnector } from "wagmi";
import { celo } from "wagmi/chains";
import { celoTransport } from "~/config/viem.config.server";
import { PaperWallet } from "~/utils/paper-wallet";
import { normalizeChainId } from "./utils";

const NO_KEY_ERROR = "No key";
const NO_ACCOUNT_ERROR = "No Account Found";

export interface PaperConnectorOptions {
  chainId?: number;
}

type NamespaceMethods =
  | "wallet_addEthereumChain"
  | "wallet_switchEthereumChain";

type CapAccount = {
  address: `0x${string}`;
  capabilities: Record<string, unknown>;
};

type Properties = {
  connect(parameters?: {
    chainId?: number;
    isReconnecting?: boolean;
    withCapabilities?: false;
  }): Promise<{ accounts: readonly `0x${string}`[]; chainId: number }>;

  connect(parameters: {
    chainId?: number;
    isReconnecting?: boolean;
    withCapabilities: true;
  }): Promise<{ accounts: readonly CapAccount[]; chainId: number }>;
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
export const paperConnector = (storage: Storage) =>
  createConnector<boolean, Properties, StorageItem>((config) => ({
    id: "paperConnector",
    name: "Paper Wallet",
    type: "paperConnect" as const,

    requestedChainsStorageKey: `paperConnector.requestedChains`,
    async setup() {
      const provider = await this.getProvider().catch(() => null);
      if (!provider) return;
    },
    async isAuthorized() {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (typeof window === "undefined") return false;
      const wallet = PaperWallet.loadFromStorage(storage);
      return Boolean(wallet);
    },


    connect: (async (parameters?: {
      chainId?: number;
      isReconnecting?: boolean;
      withCapabilities?: boolean;
    }) => {
      if (parameters?.chainId && parameters.chainId !== celo.id)
        throw new Error(`Unsupported chainId: ${parameters.chainId}`);

      let accounts: `0x${string}`[] = [];
      const wallet = PaperWallet.loadFromStorage(storage);
      if (wallet) {
        accounts = [wallet.getAddress()];
      } else {
        config.emitter.emit("message", { type: "connecting" });
        try {
          const w = await PaperWallet.fromQRCode(storage);
          accounts = [w.getAddress()];
        } catch (err) {
          config.emitter.emit("disconnect");
          throw err;
        }
      }

      const chainIdNum = celo.id;

      if (parameters?.withCapabilities) {
        const withCaps = accounts.map((a) => ({
          address: a,
          capabilities: {},
        })) as readonly CapAccount[];
        return { accounts: withCaps, chainId: chainIdNum };
      }

      return { accounts: accounts as readonly `0x${string}`[], chainId: chainIdNum };
    }) as Properties['connect'],

    async getAccounts(): Promise<readonly Address[]> {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const address = PaperWallet.loadFromStorage(storage)?.getAddress();
      if (!address) throw new Error(NO_ACCOUNT_ERROR);
      const addresses = [address] as const;
      return addresses;
    },

    async getClient() {
      const accounts = await this.getAccounts();

      return createWalletClient({
        ...config,
        chain: celo,
        account: {
          address: accounts[0],
          source: "privateKey",
          publicKey: "0x000",
          type: "local",
          signMessage: async ({ message }) => {
            const wallet = PaperWallet.loadFromStorage(storage);
            if (!wallet) throw new Error(NO_KEY_ERROR);
            const account = await wallet.getAccount();
            const result = await account.signMessage({
              message: message,
            });
            return result;
          },
          signTransaction: async (transaction) => {
            const wallet = PaperWallet.loadFromStorage(storage);
            if (!wallet) throw new Error(NO_KEY_ERROR);
            const account = await wallet.getAccount();
            const result = await account.signTransaction(transaction);
            return result;
          },
          signTypedData: async (typedData) => {
            const wallet = PaperWallet.loadFromStorage(storage);
            if (!wallet) throw new Error(NO_KEY_ERROR);
            const account = await wallet.getAccount();
            const result = await account.signTypedData(typedData);
            return result;
          },
        } as LocalAccount<string, `0x${string}`>,
        transport: celoTransport,
      });
    },

    async getProvider() {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    },

    onConnect: (_connectInfo: ProviderConnectInfo) => {
      // Implement your logic here
    },

    getNamespaceChainsIds: (): number[] => {
      // Implement your logic here

      return [];
    },

    getNamespaceMethods: () => {
      // Implement your logic here

      return [];
    },

    getRequestedChainsIds() {
      // Implement your logic here
      return Promise.resolve([]);
    },

    onAccountsChanged: (accounts: string[]) => {
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
      return celo.id;
    },

    onDisconnect: () => {
      PaperWallet.removeFromStorage(storage);
      config.emitter.emit("disconnect");
    },

    async disconnect(): Promise<void> {
      PaperWallet.removeFromStorage(storage);
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
