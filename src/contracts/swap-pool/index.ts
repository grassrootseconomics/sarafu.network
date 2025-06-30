import {
  type Chain,
  getAddress,
  parseGwei,
  type PublicClient,
  type Transport,
} from "viem";
import { TokenIndex } from "../erc20-token-index";
import { PriceIndexQuote } from "../price-index-quote";
import { getWriterWalletClient } from "../writer";
import { swapPoolAbi, swapPoolBytecode } from "./contract";

export class SwapPoolContract<t extends Transport, c extends Chain> {
  address: `0x${string}`;

  publicClient: PublicClient<t, c>;
  contract: { address: `0x${string}`; abi: typeof swapPoolAbi };
  private tokenIndex: TokenIndex<t, c> | null = null;
  private quoter: PriceIndexQuote<t, c> | null = null;
  private vouchers: `0x${string}`[] = [];
  private name: string | null = null;
  private owner: string | null = null;
  private quoterAddress: string | null = null;

  constructor(address: `0x${string}`, publicClient: PublicClient<t, c>) {
    this.address = getAddress(address);
    this.contract = { address: this.address, abi: swapPoolAbi } as const;
    this.publicClient = publicClient;
  }
  static async deploy<t extends Transport, c extends Chain>({
    publicClient,
    name,
    symbol,
    decimals,
    tokenRegistryAddress,
    limiterAddress,
  }: {
    publicClient: PublicClient<t, c>;
    name: string;
    symbol: string;
    decimals: number;
    tokenRegistryAddress: `0x${string}`;
    limiterAddress: `0x${string}`;
  }) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.deployContract({
      abi: swapPoolAbi,
      bytecode: swapPoolBytecode,
      args: [name, symbol, decimals, tokenRegistryAddress, limiterAddress],
      gas: 4_000_000n,
      maxFeePerGas: parseGwei("27"),
      maxPriorityFeePerGas: 5n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    if (receipt.status !== "success" || !receipt.contractAddress) {
      throw new Error("Failed to deploy swap pool");
    }
    return new SwapPoolContract(receipt.contractAddress, publicClient);
  }
  async getVouchersCount() {
    const tokenIndex = await this.getTokenIndex();
    return await tokenIndex.entryCount();
  }
  async getVouchers() {
    if (this.vouchers.length === 0) {
      const tokenIndex = await this.getTokenIndex();
      this.vouchers = await tokenIndex.getAllVouchers();
    }
    return this.vouchers;
  }

  async getName() {
    if (!this.name) {
      this.name = await this.publicClient.readContract({
        ...this.contract,
        functionName: "name",
      });
    }
    return this.name;
  }
  async hasToken(token: `0x${string}`) {
    const tokenIndex = await this.getTokenIndex();
    return tokenIndex.has(token);
  }
  async getOwner() {
    if (!this.owner) {
      this.owner = await this.publicClient.readContract({
        ...this.contract,
        functionName: "owner",
      });
    }
    return this.owner;
  }
  async getQuoterAddress() {
    if (!this.quoterAddress) {
      this.quoterAddress = await this.publicClient.readContract({
        ...this.contract,
        functionName: "quoter",
      });
    }
    return getAddress(this.quoterAddress);
  }
  async getTokenIndex() {
    if (!this.tokenIndex) {
      const address = await this.getTokenIndexAddress();
      this.tokenIndex = new TokenIndex(this.publicClient, address);
    }
    return this.tokenIndex;
  }
  async getQuoter() {
    if (!this.quoter) {
      const address = await this.getQuoterAddress();
      this.quoter = new PriceIndexQuote(this.publicClient, address);
    }
    return this.quoter;
  }
  async getFeeAddress() {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "feeAddress",
    });
  }
  async getFeePpm() {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "feePpm",
    });
  }
  async getTokenIndexAddress() {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "tokenRegistry",
    });
  }
  async getTokenLimiterAddress() {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "tokenLimiter",
    });
  }
  async setQuoter(quoterAddress: `0x${string}`) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "setQuoter",
      args: [quoterAddress],
    });
    const result = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return result;
  }
  async transferOwnership(newOwner: `0x${string}`) {
    const walletClient = getWriterWalletClient();
    const hash = await walletClient.writeContract({
      ...this.contract,
      functionName: "transferOwnership",
      args: [newOwner],
    });
    const result = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    return result;
  }
}
