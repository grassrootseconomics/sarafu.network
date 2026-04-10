import { isAddress, type Address } from "viem";
import { trpc } from "../trpc";

/**
 * Hook for resolving ENS names from addresses
 *
 * @param address - The Ethereum address to resolve
 * @returns Object containing both ENS resolution results
 */
export function useENS({
  address,
  disabled,
}: {
  address: Address | undefined;
  disabled?: boolean;
}) {
  const enabled = Boolean(address) && isAddress(address!) && !disabled;
  return trpc.ens.getENS.useQuery(
    { address: address! },
    {
      enabled: enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useENSExists({ ensName }: { ensName: string }) {
  return trpc.ens.exists.useQuery({ ensName });
}

/**
 * Hook for resolving addresses from ENS names
 * Only resolves .eth domains
 *
 * @param ensName - The ENS name to resolve
 * @returns Query result containing address resolution
 */
export function useENSAddress({ ensName }: { ensName: string }) {
  const isValidENSName = Boolean(ensName && ensName.endsWith(".eth"));

  return trpc.ens.getAddress.useQuery(
    { ensName },
    {
      enabled: isValidENSName,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
