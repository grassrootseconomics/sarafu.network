import {
  createPublicClient,
  http,
  type HttpTransport,
  type PublicClient,
} from "viem";
import { abi } from "~/contracts/period-simple/contract";
import { getViemChain, type ChainType } from "~/lib/web3";

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

  async check(subjectAddress: `0x${string}`) {
    return this.publicClient.readContract({
      abi,
      address: this.address,
      functionName: "check",
      args: [subjectAddress],
    });
  }
  // Add other methods based on the contract ABI as needed...
}
