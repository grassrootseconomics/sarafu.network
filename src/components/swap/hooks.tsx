import { useMemo } from "react";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { tokenIndexABI } from "~/contracts/erc20-token-index/contract";
import { limiterAbi } from "~/contracts/limiter/contract";
import { priceIndexQuoteAbi } from "~/contracts/price-index-quote/contract";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { type TokenValue } from "./types";

function getFormatted(
  value: bigint | undefined,
  decimals: number | undefined
): TokenValue | undefined {
  if (!decimals) return undefined;
  if (!value || typeof value !== "bigint")
    return {
      formatted: "0",
      formattedNumber: 0,
      value: 0n,
      decimals: decimals,
    };
  const val = {
    formatted: formatUnits(value, decimals),
    formattedNumber: Number(formatUnits(value, decimals)),
    value: value,
    decimals: decimals,
  };
  return val;
}

export function convert(
  fromAmount: string | undefined,
  fromToken?: {
    decimals: number;
    priceIndex: bigint;
  },
  toToken?: {
    decimals: number;
    priceIndex: bigint;
  }
) {
  if (!fromToken || !toToken) return undefined;
  const exchangeRate =
    Number(fromToken.priceIndex) / Number(toToken.priceIndex);

  const toAmount = Number(fromAmount ?? 0) * exchangeRate;
  return getFormatted(
    parseUnits(toAmount.toString(), toToken.decimals),
    toToken.decimals
  );
}
export const useMultipleSwapDetails = (
  addresses: `0x${string}`[],
  quoterAddress?: `0x${string}`,
  swapPoolAddress?: `0x${string}`,
  limiterAddress?: `0x${string}`
) => {
  const account = useAccount();

  // Create an array of contract objects
  const contracts = useMemo(
    () =>
      addresses.flatMap((address) => {
        const erc20Contract = { address: address, abi: erc20Abi } as const;
        const limiterContract = {
          address: limiterAddress,
          abi: limiterAbi,
        } as const;

        const quoterContract = {
          address: quoterAddress,
          abi: priceIndexQuoteAbi,
          query: {
            enabled: Boolean(quoterAddress),
          },
        } as const;

        return [
          { ...erc20Contract, functionName: "symbol" },
          { ...erc20Contract, functionName: "name" },
          { ...erc20Contract, functionName: "decimals" },
          {
            ...erc20Contract,
            functionName: "allowance",
            query: {
              enabled: Boolean(account) && Boolean(swapPoolAddress),
            },
            args: [account.address, swapPoolAddress],
          },
          { ...quoterContract, functionName: "priceIndex", args: [address] },
          {
            ...erc20Contract,
            functionName: "balanceOf",
            args: [account.address],
          },
          {
            ...erc20Contract,
            functionName: "balanceOf",
            args: [swapPoolAddress],
          },

          {
            ...limiterContract,
            functionName: "limitOf",
            query: {
              enabled: Boolean(address) && Boolean(swapPoolAddress),
            },
            args: [address, swapPoolAddress],
          },
        ] as const;
      }),
    [addresses, limiterAddress, quoterAddress, account, swapPoolAddress]
  );

  const { data, error, refetch } = useReadContracts({
    contracts: contracts,
  });

  // Process the fetched data
  const details = useMemo(
    () =>
      addresses?.map((address, index) => {
        const baseIndex = index * 8;
        const symbol = data?.[baseIndex]?.result as string | undefined;
        const name = data?.[baseIndex + 1]?.result as string | undefined;
        const decimals = data?.[baseIndex + 2]?.result
          ? Number(data?.[baseIndex + 2]?.result)
          : undefined;
        const allowance = getFormatted(
          data?.[baseIndex + 3]?.result as bigint | undefined,
          decimals
        );
        const priceIndex =
          data?.[baseIndex + 4]?.result === BigInt(0)
            ? 10000n
            : (data?.[baseIndex + 4]?.result as bigint | undefined);
        const userBalance = getFormatted(
          data?.[baseIndex + 5]?.result as bigint | undefined,
          decimals
        );
        const poolBalance = getFormatted(
          data?.[baseIndex + 6]?.result as bigint | undefined,
          decimals
        );
        const limitOf = getFormatted(
          data?.[baseIndex + 7]?.result as bigint | undefined,
          decimals
        );
        const swapLimit =
          limitOf && poolBalance
            ? getFormatted(limitOf.value - poolBalance.value, decimals)
            : undefined;
        return {
          address,
          allowance,
          userBalance,
          symbol,
          name,
          decimals,
          priceIndex,
          poolBalance,
          limitOf,
          swapLimit,
        };
      }),
    [addresses, data]
  );

  return { data: details, error, refetch };
};

export const useERC20Token = (
  address: `0x${string}`,
  balanceOfAddress: `0x${string}`
) => {
  const contract = { address, abi: erc20Abi } as const;
  const query = useReadContracts({
    contracts: [
      {
        ...contract,
        functionName: "decimals",
      },
      {
        ...contract,
        functionName: "symbol",
      },
      {
        ...contract,
        functionName: "name",
      },
      {
        ...contract,
        functionName: "totalSupply",
      },
      {
        ...contract,
        functionName: "balanceOf",
        args: [balanceOfAddress],
      },
    ],
  });
  const decimals = query.data?.[0].result;
  const symbol = query.data?.[1].result;
  const name = query.data?.[2].result;
  const totalSupply = query.data?.[3].result;
  const balance =
    query.data?.[4].result && decimals
      ? formatUnits(query.data?.[4].result, decimals)
      : "";
  return { decimals, symbol, name, totalSupply, query, balance };
};
export const useContractIndex = (address?: `0x${string}`) => {
  const contract = { address, abi: tokenIndexABI } as const;
  const info = useReadContracts({
    query: {
      enabled: Boolean(address),
    },
    contracts: [
      {
        ...contract,
        functionName: "entryCount",
      },
      {
        ...contract,
        functionName: "owner",
      },
    ],
  });
  const entryCount = info.data?.[0].result ?? 0;
  const owner = info.data?.[1].result ?? 0;
  const c = Array.from(
    { length: entryCount ? Number(entryCount) : 0 },
    (_, i) => i
  ).map((i) => {
    return {
      ...contract,
      functionName: "entry",
      args: [BigInt(i)],
    } as const;
  });
  const contracts = useReadContracts({
    query: {
      enabled: Boolean(address),
    },
    contracts: c,
  });
  return { contracts, owner, entryCount };
};

export const usePriceIndex = (
  voucher_address?: `0x${string}`,
  contract_address?: `0x${string}`
) => {
  const contract = {
    address: contract_address,
    abi: priceIndexQuoteAbi,
  } as const;

  const priceIndex = useReadContract({
    ...contract,
    functionName: "priceIndex",
    query: {
      enabled: Boolean(contract_address) && Boolean(voucher_address),
    },
    args: [voucher_address!],
  });

  return priceIndex;
};
export const useLimitOf = (
  voucher_address?: `0x${string}`,
  swap_pool_address?: `0x${string}`,
  contract_address?: `0x${string}`
) => {
  const contract = {
    address: contract_address,
    abi: limiterAbi,
  } as const;

  const limitOf = useReadContract({
    ...contract,
    functionName: "limitOf",
    query: {
      enabled:
        Boolean(contract_address) &&
        Boolean(voucher_address) &&
        Boolean(swap_pool_address),
    },
    args: [voucher_address!, swap_pool_address!],
  });

  return limitOf;
};

export const useSwapPool = (address: `0x${string}`) => {
  const contract = { address, abi: swapPoolAbi } as const;
  const query = useReadContracts({
    contracts: [
      {
        ...contract,
        functionName: "owner",
      },
      {
        ...contract,
        functionName: "name",
      },
      {
        ...contract,
        functionName: "quoter",
      },
      {
        ...contract,
        functionName: "feeAddress",
      },
      {
        ...contract,
        functionName: "feePpm",
      },
      {
        ...contract,
        functionName: "tokenLimiter",
      },
      {
        ...contract,
        functionName: "tokenRegistry",
      },
    ],
  });
  const owner = query.data?.[0].result;
  const name = query.data?.[1].result;
  const quoter = query.data?.[2].result;
  const feeAddress = query.data?.[3].result;
  const feePpm = query.data?.[4].result;
  const tokenLimiter = query.data?.[5].result;
  const tokenRegistry = query.data?.[6].result;
  const tokenIndex = useContractIndex(tokenRegistry);
  const vouchers = useMemo(() => {
    return (
      tokenIndex.contracts.data?.map(
        (voucher) => voucher.result as `0x${string}`
      ) ?? []
    );
  }, [tokenIndex]);
  const voucherDetails = useMultipleSwapDetails(
    vouchers ?? [],
    quoter,
    address,
    tokenLimiter
  );
  const feePercentage = feePpm ? Number(feePpm) / 10000 : 0;
  return {
    address: address,
    feePercentage,
    tokenIndex,
    owner,
    name,
    quoter,
    feeAddress,
    feePpm,
    tokenLimiter,
    tokenRegistry,
    vouchers,
    voucherDetails,
  };
};
