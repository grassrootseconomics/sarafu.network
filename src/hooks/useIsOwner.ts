// hooks/useIsWriter.ts
import { useReadContract } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useUser } from "~/hooks/useAuth";

export function useIsOwner(voucherAddress: string) {
  const user = useUser();
  const owner = useReadContract({
    abi: abi,
    address: voucherAddress as `0x${string}`,
    query: {
      enabled: !!voucherAddress,
    },
    functionName: "owner",
  });
  return owner.data === user?.account.blockchain_address;
}
