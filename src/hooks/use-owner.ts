// hooks/useIsWriter.ts
import { useReadContract } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";

export function useContractOwner(address: string) {
  const owner = useReadContract({
    abi: abi,
    address: address as `0x${string}`,
    query: {
      enabled: !!address,
    },
    functionName: "owner",
  });
  return owner;
}
