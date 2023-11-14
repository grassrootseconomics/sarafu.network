import {
  createPublicClient,
  http,
  HttpTransport,
  type PublicClient,
} from "viem";
import { abi } from "~/contracts/period-simple/contract";
import { ChainType, getViemChain } from "~/lib/web3";

const config = { chain: getViemChain(), transport: http() };

export class PeriodSimple {
  address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor(
    address: `0x${string}`,
    publicClient?: PublicClient<HttpTransport, ChainType>
  ) {
    this.address = address;
    this.publicClient = publicClient ?? createPublicClient(config);
  }

  async have(subjectAddress: `0x${string}`) {
    return this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "have",
      args: [subjectAddress],
    });
  }
  // Add other methods based on the contract ABI as needed...
}
