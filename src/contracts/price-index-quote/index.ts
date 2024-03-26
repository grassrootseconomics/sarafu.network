import { type HttpTransport, type PublicClient } from "viem";
import { type getViemChain } from "~/lib/web3";
import { priceIndexQuoteAbi } from "./contract";

type ChainType = ReturnType<typeof getViemChain>;

export class PriceIndexQuoter {
  private address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;
  contract: { address: `0x${string}`; abi: typeof priceIndexQuoteAbi };

  constructor(
    address: `0x${string}`,
    publicClient: PublicClient<HttpTransport, ChainType>
  ) {
    this.address = address;
    this.contract = { address: address, abi: priceIndexQuoteAbi } as const;
    this.publicClient = publicClient;
  }

  getAddress(): `0x${string}` {
    return this.address;
  }

  async priceIndex(token_address: `0x${string}`) {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "priceIndex",
      args: [token_address],
    });
  }
  async owner() {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "owner",
    });
  }
  async defaultExchangeRate() {
    return this.publicClient.readContract({
      ...this.contract,
      functionName: "DEFAULT_EXCHANGE_RATE",
    });
  }
}
