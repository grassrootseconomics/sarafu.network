import { Connector, type ConnectorData } from "@wagmi/connectors";
import {
  createWalletClient,
  getAddress,
  http,
  type Chain,
  type LocalAccount,
} from "viem";
import { PaperWallet } from "~/utils/paper-wallet";
import { getViemChain } from "../web3";
import { normalizeChainId } from "./utils";

const IS_SERVER = typeof window === "undefined";
const NO_KEY_ERROR = "No key";
const NO_ACCOUNT_ERROR = "No Account Found";

export interface PaperConnectorOptions {}

export class PaperConnector extends Connector {
  ready = !IS_SERVER;
  readonly id = "paper";
  readonly name = "Paper";

  constructor(config: { chains?: Chain[]; options: PaperConnectorOptions }) {
    super(config);
  }

  async isAuthorized() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const wallet = PaperWallet.loadFromSessionStorage();
    return Boolean(wallet);
  }

  async connect(): Promise<Required<ConnectorData>> {
    const wallet = PaperWallet.loadFromSessionStorage();
    if (wallet)
      return {
        account: wallet.getAddress(),
        chain: {
          id: getViemChain().id,
          unsupported: false,
        },
      };

    try {
      this.emit("message", { type: "connecting" });
      const wallet = await PaperWallet.fromQRCode();
      const address = wallet.getAddress();
      const data = {
        account: address,
        chain: {
          id: getViemChain().id,
          unsupported: false,
        },
      };
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAccount() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const address = PaperWallet.loadFromSessionStorage()?.getAddress();
    if (!address) throw new Error(NO_ACCOUNT_ERROR);
    return address;
  }

  async getWalletClient() {
    const account = await this.getAccount();
    return createWalletClient({
      account: {
        address: account,
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
  }
  async getProvider() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return null;
  }

  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0 || !accounts[0]) this.emit("disconnect");
    else this.emit("change", { account: getAddress(accounts[0]) });
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  }

  async getChainId(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getViemChain().id;
  }

  protected onDisconnect(): void {
    PaperWallet.removeFromSessionStorage();
    this.emit("disconnect");
  }

  async disconnect(): Promise<void> {
    PaperWallet.removeFromSessionStorage();
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.emit("disconnect");
  }
}
