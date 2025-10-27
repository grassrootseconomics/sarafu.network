// hooks/useIsWriter.ts
import { useReadContract } from "wagmi";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { useMultisig } from "~/contracts/multi-sig";
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
  const multisig = useMultisig(owner.data as `0x${string}`);
  const isMultisigOwner = multisig.data?.owners?.some(
    (o) => o.toLowerCase() === auth?.session?.address?.toLowerCase()
  );
  return owner.data === auth?.session?.address || isMultisigOwner;
}
