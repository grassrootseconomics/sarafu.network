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

export function useContractOwner(address: string) {
  const auth = useAuth();
  const owner = useReadContract({
    abi: abi,
    address: address as `0x${string}`,
    query: {
      enabled: !!address,
    },
    functionName: "owner",
  });
  const multisig = useMultisig(owner.data as `0x${string}`);
  const isMultisigOwner = multisig.data?.owners?.some(
    (o) => o.toLowerCase() === auth?.session?.address?.toLowerCase()
  );

  return {
    address: owner.data,
    isOwner: owner.data === auth?.session?.address,
    isMultiSigSigner: isMultisigOwner,
    isMultiSig: multisig.data?.isMultisig,
    isContract: multisig.data?.isContract,
    isMultisig: multisig.data?.isMultisig,
    multisigType: multisig.data?.multisigType,
    owners: multisig.data?.owners,
    threshold: multisig.data?.threshold,
  };
}
