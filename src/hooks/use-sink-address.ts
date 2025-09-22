// hooks/useIsWriter.ts
import { useReadContract } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";

export function useContractSinkAddress(address: string, enabled: boolean) {
  const owner = useReadContract({
    abi: abi,
    address: address as `0x${string}`,
    query: {
      enabled: !!address && enabled,
    },
    functionName: "sinkAddress",
  });
  return owner;
}
