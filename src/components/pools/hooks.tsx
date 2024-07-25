import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  addVoucherToPool,
  getContractIndex,
  getLimitOf,
  getMultipleSwapDetails,
  getPriceIndex,
  getSwapPool,
  removePoolVoucher,
  updatePoolVoucher,
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

export const useSwapPool = (
  swapPoolAddress: `0x${string}`,
  initialData?: SwapPool
) => {
  const { address: accountAddress } = useAccount();

  return useQuery({
    queryKey: ["swapPool", swapPoolAddress, accountAddress],
    queryFn: () => getSwapPool(swapPoolAddress, accountAddress),
    initialData: initialData,
    staleTime: 1000 * 10,
  });
};

export const useAddPoolVoucher = () => {
  const queryClient = useQueryClient();
  const { address: accountAddress } = useAccount();
  return useMutation({
    onSuccess(data, variables) {
      // 10 second timeout
      setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: ["swapPool", variables.swapPoolAddress, accountAddress],
        });
      }, 5000);
    },
    mutationFn: ({
      swapPoolAddress,
      voucherAddress,
      limit,
      exchangeRate,
    }: {
      swapPoolAddress: `0x${string}`;
      voucherAddress: `0x${string}`;
      limit: bigint;
      exchangeRate: bigint;
    }) =>
      addVoucherToPool(voucherAddress, swapPoolAddress, limit, exchangeRate),
  });
};
export const useRemovePoolVoucher = () => {
  const queryClient = useQueryClient();
  const { address: accountAddress } = useAccount();

  return useMutation({
    onSuccess(data, variables) {
      // 10 second timeout
      setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: ["swapPool", variables.swapPoolAddress, accountAddress],
        });
      }, 5000);
    },
    mutationFn: async ({
      swapPoolAddress,
      voucherAddress,
    }: {
      swapPoolAddress: `0x${string}`;
      voucherAddress: `0x${string}`;
    }) => removePoolVoucher(voucherAddress, swapPoolAddress),
  });
};

export const useUpdatePoolVoucher = () => {
  const queryClient = useQueryClient();
  const { address: accountAddress } = useAccount();
  return useMutation({
    onSuccess(data, variables) {
      // 10 second timeout
      setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: ["swapPool", variables.swapPoolAddress, accountAddress],
        });
      }, 5000);
    },
    mutationFn: ({
      swapPoolAddress,
      voucherAddress,
      limit,
      exchangeRate,
    }: {
      swapPoolAddress: `0x${string}`;
      voucherAddress: `0x${string}`;
      limit: bigint;
      exchangeRate: bigint;
    }) =>
      updatePoolVoucher(voucherAddress, swapPoolAddress, limit, exchangeRate),
  });
};
