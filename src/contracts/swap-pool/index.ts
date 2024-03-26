import { getAddress, type HttpTransport, type PublicClient } from "viem";
import { type getViemChain } from "~/lib/web3";
import { TokenIndex } from "../erc20-token-index";
import { PriceIndexQuoter } from "../price-index-quote";
import { swapPoolAbi } from "./contract";

type ChainType = ReturnType<typeof getViemChain>;

export class SwapPool {
  address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;
  contract: { address: `0x${string}`; abi: typeof swapPoolAbi };
  tokenIndex: TokenIndex;
  private quoter: PriceIndexQuoter | null = null;
  private vouchers: `0x${string}`[] = [];
  private name: string | null = null;
  private owner: string | null = null;
  private quoterAddress: string | null = null;

  constructor(
    address: `0x${string}`,
    publicClient: PublicClient<HttpTransport, ChainType>
  ) {
    this.address = address;
    this.contract = { address: this.address, abi: swapPoolAbi } as const;
    this.publicClient = publicClient;
    this.tokenIndex = new TokenIndex(this.publicClient, this.address);
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
      this.quoter = new PriceIndexQuoter(
        await this.getQuoterAddress(),
        this.publicClient
      );
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
}
