"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useConfig, usePublicClient } from "wagmi";
import {
  addVoucherToPool,
  getContractIndex,
  getMultipleSwapDetails,
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
  const client = usePublicClient();

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
        client,
        addresses,
        quoterAddress,
        swapPoolAddress,
        limiterAddress,
        accountAddress
      ),
    enabled: !!accountAddress && !!client,
  });
};

export const useContractIndex = (address?: `0x${string}`) => {
  const client = usePublicClient();

  return useQuery({
    queryKey: ["contractIndex", address],
    queryFn: () => getContractIndex(client, address!),
    enabled: !!address && !!client,
    staleTime: 60_000,
  });
};

export const useSwapPool = (
  swapPoolAddress: `0x${string}` | undefined,
  initialData?: SwapPool
) => {
  const { address: accountAddress } = useAccount();
  const client = usePublicClient();
  return useQuery({
    queryKey: ["swapPool", swapPoolAddress, accountAddress],
    queryFn: () => getSwapPool(client, swapPoolAddress!, accountAddress),
    initialData: initialData,
    enabled: !!swapPoolAddress && !!client,
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
  const client = usePublicClient();
  return useQuery({
    queryKey: ["voucherDetails", voucherAddress],
    queryFn: () => getVoucherDetails(client, voucherAddress),
    enabled: !!voucherAddress && !!client,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
