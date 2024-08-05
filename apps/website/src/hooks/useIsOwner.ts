// hooks/useIsWriter.ts
import { abi } from "@grassroots/contracts/erc20-demurrage-token/contract";
import { useReadContract } from "wagmi";

import { useAuth } from "~/hooks/useAuth";

export function useIsOwner(voucherAddress: string) {
  const auth = useAuth();
  const owner = useReadContract({
    abi: abi,
    address: voucherAddress as `0x${string}`,
    query: {
      enabled: !!voucherAddress,
    },
    functionName: "owner",
  });
  return owner.data === auth?.user?.account.blockchain_address;
}
