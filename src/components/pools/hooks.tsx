"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useConfig } from "wagmi";
import {
  addVoucherToPool,
  getContractIndex,
  getLimitOf,
  getMultipleSwapDetails,
  getPriceIndex,
  getSwapPool,
  getVoucherDetails,
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
  const config = useConfig();

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
        config,
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
  const config = useConfig();

  return useQuery({
    queryKey: ["contractIndex", address],
    queryFn: () => getContractIndex(config, address!),
    enabled: !!address,
    staleTime: 60_000,
  });
};

export const usePriceIndex = (
  voucherAddress?: `0x${string}`,
  contractAddress?: `0x${string}`
) => {
  const config = useConfig();

  return useQuery({
    queryKey: ["priceIndex", voucherAddress, contractAddress],
    queryFn: () => getPriceIndex(config, voucherAddress!, contractAddress!),
    enabled: !!voucherAddress && !!contractAddress,
  });
};

export const useLimitOf = (
  voucherAddress?: `0x${string}`,
  swapPoolAddress?: `0x${string}`,
  contractAddress?: `0x${string}`
) => {
  const config = useConfig();

  return useQuery({
    queryKey: ["limitOf", voucherAddress, swapPoolAddress, contractAddress],
    queryFn: () =>
      getLimitOf(config, voucherAddress!, swapPoolAddress!, contractAddress!),
    enabled: !!voucherAddress && !!swapPoolAddress && !!contractAddress,
  });
};

export const useSwapPool = (
  swapPoolAddress: `0x${string}` | undefined,
  initialData?: SwapPool
) => {
  const { address: accountAddress } = useAccount();
  const config = useConfig();

  return useQuery({
    queryKey: ["swapPool", swapPoolAddress, accountAddress],
    queryFn: () => getSwapPool(config, swapPoolAddress!, accountAddress),
    initialData: initialData,
    enabled: !!swapPoolAddress,
    staleTime: 60_000,
  });
};

export const useAddPoolVoucher = () => {
  const queryClient = useQueryClient();
  const { address: accountAddress } = useAccount();
  const config = useConfig();
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
      addVoucherToPool(
        config,
        voucherAddress,
        swapPoolAddress,
        limit,
        exchangeRate
      ),
  });
};
export const useRemovePoolVoucher = () => {
  const queryClient = useQueryClient();
  const { address: accountAddress } = useAccount();
  const config = useConfig();

  return useMutation({
    onSuccess(data, variables) {
      // 10 second timeout
      setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: ["swapPool", variables.swapPoolAddress, accountAddress],
        });
      }, 10000);
    },
    mutationFn: async ({
      swapPoolAddress,
      voucherAddress,
    }: {
      swapPoolAddress: `0x${string}`;
      voucherAddress: `0x${string}`;
    }) => removePoolVoucher(config, voucherAddress, swapPoolAddress),
  });
};

export const useUpdatePoolVoucher = () => {
  const queryClient = useQueryClient();
  const config = useConfig();

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
      updatePoolVoucher(
        config,
        voucherAddress,
        swapPoolAddress,
        limit,
        exchangeRate
      ),
  });
};

export const useVoucherDetails = (voucherAddress: `0x${string}`) => {
  const config = useConfig();
  return useQuery({
    queryKey: ["voucherDetails", voucherAddress],
    queryFn: () => getVoucherDetails(config, voucherAddress),
    enabled: !!voucherAddress,
    staleTime: Infinity,
  });
};
