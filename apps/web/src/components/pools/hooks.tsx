"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useConfig, usePublicClient } from "wagmi";
import {
  addVoucherToPool,
  getContractIndex,
  getDecimals,
  getMultipleSwapDetails,
  getSwapPool,
  getVoucherDetails,
  removePoolVoucher,
  updatePoolVoucherExchangeRate,
  updatePoolVoucherLimit,
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
    queryFn: () => {
      if (!client) throw new Error("Client not available");
      return getMultipleSwapDetails(
        client,
        addresses,
        quoterAddress,
        swapPoolAddress,
        limiterAddress,
        accountAddress
      );
    },
    enabled: !!accountAddress && !!client,
  });
};

export const useContractIndex = (address?: `0x${string}`) => {
  const config = useConfig();
  const client = usePublicClient({ config });

  return useQuery({
    queryKey: ["contractIndex", address],
    queryFn: () => {
      if (!client) throw new Error("Client not available");
      return getContractIndex(client, address!);
    },
    enabled: !!address && !!client,
    staleTime: 60_000,
  });
};

export const useSwapPool = (
  swapPoolAddress: `0x${string}` | undefined,
  initialData?: SwapPool
) => {
  const { address: accountAddress } = useAccount();
  const config = useConfig();
  const client = usePublicClient({ config });

  return useQuery({
    queryKey: ["swapPool", swapPoolAddress, accountAddress],
    queryFn: () => {
      if (!client) throw new Error("Client not available");
      return getSwapPool(client, swapPoolAddress!, accountAddress);
    },
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
        accountAddress as `0x${string}`,
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
    }) =>
      removePoolVoucher(
        config,
        accountAddress as `0x${string}`,
        voucherAddress,
        swapPoolAddress
      ),
  });
};

export const useUpdatePoolVoucherLimit = () => {
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
    }: {
      swapPoolAddress: `0x${string}`;
      voucherAddress: `0x${string}`;
      limit: bigint;
    }) =>
      updatePoolVoucherLimit(
        config,
        accountAddress as `0x${string}`,
        voucherAddress,
        swapPoolAddress,
        limit
      ),
  });
};

export const useDecimals = (voucherAddress?: `0x${string}`) => {
  const config = useConfig();
  const client = usePublicClient({ config });

  return useQuery({
    queryKey: ["decimals", voucherAddress],
    queryFn: () => {
      if (!client) throw new Error("Client not available");
      if (!voucherAddress) return null;
      return getDecimals(client, voucherAddress);
    },
    enabled: !!voucherAddress && !!client,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
export const useUpdatePoolVoucherExchangeRate = () => {
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
      exchangeRate,
    }: {
      swapPoolAddress: `0x${string}`;
      voucherAddress: `0x${string}`;
      exchangeRate: bigint;
    }) =>
      updatePoolVoucherExchangeRate(
        config,
        accountAddress as `0x${string}`,
        voucherAddress,
        swapPoolAddress,
        exchangeRate
      ),
  });
};
export const useVoucherDetails = (voucherAddress?: `0x${string}`) => {
  const config = useConfig();
  const client = usePublicClient({ config });

  return useQuery({
    queryKey: ["voucherDetails", voucherAddress],
    queryFn: () => {
      if (!client) throw new Error("Client not available");
      if (!voucherAddress) return null;
      return getVoucherDetails(client, voucherAddress);
    },
    enabled: !!voucherAddress && !!client,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
