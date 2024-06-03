import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  getContractIndex,
  getLimitOf,
  getMultipleSwapDetails,
  getPriceIndex,
  getSwapPool,
} from "./contract-functions";
import { type SwapPool } from "./types";

export const useMultipleSwapDetails = (
  addresses: `0x${string}`[],
  quoterAddress?: `0x${string}`,
  swapPoolAddress?: `0x${string}`,
  limiterAddress?: `0x${string}`
) => {
  const { address: accountAddress } = useAccount();

  return useQuery({
    queryKey: [
      "multipleSwapDetails",
      addresses,
      quoterAddress,
      swapPoolAddress,
      limiterAddress,
      accountAddress,
    ],
    queryFn: () =>
      getMultipleSwapDetails(
        addresses,
        quoterAddress,
        swapPoolAddress,
        limiterAddress,
        accountAddress
      ),
    enabled: !!accountAddress,
  });
};

export const useContractIndex = (address?: `0x${string}`) => {
  return useQuery({
    queryKey: ["contractIndex", address],
    queryFn: () => getContractIndex(address!),
    enabled: !!address,
  });
};

export const usePriceIndex = (
  voucherAddress?: `0x${string}`,
  contractAddress?: `0x${string}`
) => {
  return useQuery({
    queryKey: ["priceIndex", voucherAddress, contractAddress],
    queryFn: () => getPriceIndex(voucherAddress!, contractAddress!),
    enabled: !!voucherAddress && !!contractAddress,
  });
};

export const useLimitOf = (
  voucherAddress?: `0x${string}`,
  swapPoolAddress?: `0x${string}`,
  contractAddress?: `0x${string}`
) => {
  return useQuery({
    queryKey: ["limitOf", voucherAddress, swapPoolAddress, contractAddress],
    queryFn: () =>
      getLimitOf(voucherAddress!, swapPoolAddress!, contractAddress!),
    enabled: !!voucherAddress && !!swapPoolAddress && !!contractAddress,
  });
};

export const useSwapPool = (swapPoolAddress: `0x${string}`, initialData?: SwapPool) => {
  const { address: accountAddress } = useAccount();

  return useQuery({
    queryKey: ["swapPool", swapPoolAddress, accountAddress],
    queryFn: () => getSwapPool(swapPoolAddress, accountAddress),
    initialData: initialData,
    enabled: !!swapPoolAddress,
  });
};
