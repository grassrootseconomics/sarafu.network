import type { getViemChain } from "@grassroots/shared/utils/web3";
import type { HttpTransport, PublicClient } from "viem";
import { getAddress } from "viem";

import { TokenIndex } from "../erc20-token-index";
import { PriceIndexQuote } from "../price-index-quote";
import { getWriterWalletClient } from "../writer";
import { swapPoolAbi, swapPoolBytecode } from "./contract";

type ChainType = ReturnType<typeof getViemChain>;

export class SwapPool {
  address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;
  contract: { address: `0x${string}`; abi: typeof swapPoolAbi };
  tokenIndex: TokenIndex;
  private quoter: PriceIndexQuote | null = null;
  private vouchers: `0x${string}`[] = [];
  private name: string | null = null;
  private owner: string | null = null;
  private quoterAddress: string | null = null;

  constructor(
    address: `0x${string}`,
    publicClient: PublicClient<HttpTransport, ChainType>,
  ) {
    this.address = address;
    this.contract = { address: this.address, abi: swapPoolAbi } as const;
    this.publicClient = publicClient;
    this.tokenIndex = new TokenIndex(this.publicClient, this.address);
  }
  static async deploy({
    publicClient,
    name,
    symbol,
    decimals,
    tokenRegistryAddress,
    limiterAddress,
  }: {
    publicClient: PublicClient<HttpTransport, ChainType>;
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
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });
    if (receipt.status !== "success" || !receipt.contractAddress) {
      throw new Error("Failed to deploy swap pool");
    }
    return new SwapPool(receipt.contractAddress, publicClient);
  }
  async getVouchers() {
    if (this.vouchers.length === 0) {
      this.vouchers = await this.tokenIndex.getAllVouchers();
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
    return this.tokenIndex.has(token);
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