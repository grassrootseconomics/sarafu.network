// hooks/useIsWriter.ts
import { useReadContract } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useAuth } from "~/hooks/useAuth";

export function useIsContractOwner(voucherAddress: string) {
  const auth = useAuth();
  const owner = useReadContract({
    abi: abi,
    address: voucherAddress as `0x${string}`,
    query: {
      enabled: !!voucherAddress,
    },
    functionName: "owner",
  });
  return owner.data === auth?.session?.address;
}
