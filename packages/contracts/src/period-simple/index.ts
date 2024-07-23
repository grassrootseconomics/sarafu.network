import type { ChainType } from "@grassroots/shared/utils/web3";
import type { HttpTransport, PublicClient } from "viem";
import { getViemChain } from "@grassroots/shared/utils/web3";
import { createPublicClient, http } from "viem";

import { abi } from "../period-simple/contract";

const config = { chain: getViemChain(), transport: http() };

export class PeriodSimple {
  address: `0x${string}`;

  publicClient: PublicClient<HttpTransport, ChainType>;

  constructor(
    address: `0x${string}`,
    publicClient?: PublicClient<HttpTransport, ChainType>,
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
