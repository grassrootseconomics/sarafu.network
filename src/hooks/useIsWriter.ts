// hooks/useIsWriter.ts
import { useContractRead } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useUser } from "~/hooks/useAuth";

export function useIsWriter(voucherAddress: string) {
  const user = useUser();
  const isWriter = useContractRead({
    abi: abi,
    address: voucherAddress as `0x${string}`,
    functionName: "isWriter",
    enabled: !!voucherAddress && !!user?.account.blockchain_address,
    args: [user?.account.blockchain_address as `0x${string}`],
  });
  return isWriter.data;
}
