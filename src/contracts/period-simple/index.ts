import { type Chain, type PublicClient, type Transport } from "viem";
import { abi } from "~/contracts/period-simple/contract";

export class PeriodSimple<t extends Transport, c extends Chain> {
  address: `0x${string}`;

  publicClient: PublicClient<t, c>;

  constructor(address: `0x${string}`, publicClient: PublicClient<t, c>) {
    this.address = address;
    this.publicClient = publicClient;
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
