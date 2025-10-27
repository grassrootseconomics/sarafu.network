"use client";

import type { Abi, Address, Hex } from "viem";
import { useAccount, useConfig } from "wagmi";
import { ownerWriteContract, type OwnerCall } from "~/contracts/multi-sig";

export function useOwnerWriteContract() {
  const config = useConfig();
  const { address } = useAccount();

  async function ownerWrite<TAbi extends Abi>(params: {
    address: Address;
    abi: TAbi;
    functionName: string;
    args?: unknown[];
    value?: bigint;
  }): Promise<Hex> {
    if (!address) throw new Error("No connected account");
    const call: OwnerCall = {
      ownedContract: params.address as unknown as `0x${string}`,
      ownedContractAbi: params.abi as unknown as Abi,
      functionName: params.functionName,
      args: params.args,
      value: params.value,
    };
    return ownerWriteContract(config, address as `0x${string}`, call);
  }

  return { ownerWrite };
}
