// hooks/useIsWriter.ts
import { useReadContract } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useAuth } from "~/hooks/useAuth";

export function useIsWriter(voucherAddress: string) {
  const auth = useAuth();
  const isWriter = useReadContract({
    abi: abi,
    address: voucherAddress as `0x${string}`,
    functionName: "isWriter",
    query: {
      enabled: !!voucherAddress && !!auth?.user?.account.blockchain_address,
    },
    args: [auth?.user?.account.blockchain_address as `0x${string}`],
  });
  return isWriter.data;
}
