import {
  type Config,
  readContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import {
  type Chain,
  erc20Abi,
  getAddress,
  type PublicClient,
  type Transport,
} from "viem";
import { defaultReceiptOptions } from "~/config/viem.config.server";
import { tokenIndexABI } from "~/contracts/erc20-token-index/contract";
import { limiterAbi } from "~/contracts/limiter/contract";
import { ownerWriteContract } from "~/contracts/multi-sig";
import { priceIndexQuoteAbi } from "~/contracts/price-index-quote/contract";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { getFormattedValue } from "~/utils/units/token";

type AppPublicClient<chain extends Chain> = PublicClient<Transport, chain>;

export const getMultipleSwapDetails = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  addresses: `0x${string}`[],
  quoterAddress?: `0x${string}`,
  swapPoolAddress?: `0x${string}`,
  limiterAddress?: `0x${string}`,
  accountAddress?: `0x${string}`
) => {
  try {
    const contracts = addresses.flatMap((tokenAddress) => {
      const erc20Contract = { address: tokenAddress, abi: erc20Abi };
      const limiterContract = { address: limiterAddress, abi: limiterAbi };
      const quoterContract = {
        address: quoterAddress,
        abi: priceIndexQuoteAbi,
      };

      return [
        { ...erc20Contract, functionName: "symbol" },
        { ...erc20Contract, functionName: "name" },
        { ...erc20Contract, functionName: "decimals" },
        {
          ...erc20Contract,
          functionName: "allowance",
          args: [accountAddress, swapPoolAddress],
        },
        {
          ...quoterContract,
          functionName: "priceIndex",
          args: [tokenAddress],
        },
        {
          ...erc20Contract,
          functionName: "balanceOf",
          args: [accountAddress],
        },
        {
          ...erc20Contract,
          functionName: "balanceOf",
          args: [swapPoolAddress],
        },
        {
          ...limiterContract,
          functionName: "limitOf",
          args: [tokenAddress, swapPoolAddress],
        },
      ];
    });
    const data = await client.multicall({
      contracts: contracts.map((contract) => ({
        ...contract,
        address: contract.address!,
      })),
    });
    const details = addresses.map((address, index) => {
      const baseIndex = index * 8;
      const symbol = data?.[baseIndex]?.result as string | undefined;
      const name = data?.[baseIndex + 1]?.result as string | undefined;
      const decimals = data?.[baseIndex + 2]?.result
        ? Number(data?.[baseIndex + 2]?.result)
        : undefined;
      const allowance = getFormattedValue(
        data?.[baseIndex + 3]?.result as bigint | undefined,
        decimals
      );
      const priceIndex =
        data?.[baseIndex + 4]?.result === BigInt(0)
          ? 10000n
          : (data?.[baseIndex + 4]?.result as bigint | undefined);
      const userBalance = getFormattedValue(
        data?.[baseIndex + 5]?.result as bigint | undefined,
        decimals
      );
      const poolBalance = getFormattedValue(
        data?.[baseIndex + 6]?.result as bigint | undefined,
        decimals
      );
      const limitOf = getFormattedValue(
        data?.[baseIndex + 7]?.result as bigint | undefined,
        decimals
      );
      const swapLimit =
        limitOf && poolBalance
          ? getFormattedValue(limitOf.value - poolBalance.value, decimals)
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
    });
    return details;
  } catch (error) {
    console.error("Error fetching swap details:", error);
    throw new Error("Failed to fetch swap details.");
  }
};

export const getName = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  address: `0x${string}`
) => {
  try {
    const contract = { address: address, abi: erc20Abi };
    const name = await client.readContract({
      ...contract,
      functionName: "name",
    });
    return name;
  } catch (error) {
    console.error("Error fetching name:", error);
    throw new Error("Failed to fetch name.");
  }
};
export const getSymbol = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  address: `0x${string}`
) => {
  try {
    const contract = { address: address, abi: erc20Abi };
    const symbol = await client.readContract({
      ...contract,
      functionName: "symbol",
    });
    return symbol;
  } catch (error) {
    console.error("Error fetching symbol:", error);
    throw new Error("Failed to fetch symbol.");
  }
};
export const getDecimals = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  address: `0x${string}`
) => {
  try {
    const contract = { address: address, abi: erc20Abi };
    const decimals = await client.readContract({
      ...contract,
      functionName: "decimals",
    });
    return decimals;
  } catch (error) {
    console.error("Error fetching decimals:", error);
    throw new Error("Failed to fetch decimals.");
  }
};

export type VoucherDetails = {
  symbol: string | undefined;
  name: string | undefined;
  decimals: number | undefined;
};
export const getVoucherDetails = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  address: `0x${string}`
): Promise<VoucherDetails> => {
  try {
    const contract = { address: address, abi: erc20Abi };
    const contracts = [
      { ...contract, functionName: "symbol" },
      { ...contract, functionName: "name" },
      { ...contract, functionName: "decimals" },
    ];
    const data = await client.multicall({
      contracts: contracts,
    });
    return {
      symbol: data?.[0]?.result as string | undefined,
      name: data?.[1]?.result as string | undefined,
      decimals: data?.[2]?.result ? Number(data?.[2]?.result) : undefined,
    };
  } catch (error) {
    console.error("Error fetching voucher details:");
    console.error("Error object:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(
      `Failed to fetch voucher details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
export const getMultipleVoucherDetails = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  addresses: `0x${string}`[]
) => {
  const contracts = addresses.flatMap((address) => [
    { address, abi: erc20Abi, functionName: "symbol" },
    { address, abi: erc20Abi, functionName: "name" },
    { address, abi: erc20Abi, functionName: "decimals" },
  ]);
  const data = await client.multicall({
    contracts: contracts,
  });
  return addresses.map((address, index) => {
    const baseIndex = index * 3;
    return {
      address,
      symbol: data?.[baseIndex]?.result as string | undefined,
      name: data?.[baseIndex + 1]?.result as string | undefined,
      decimals: data?.[baseIndex + 2]?.result
        ? Number(data?.[baseIndex + 2]?.result)
        : undefined,
    };
  });
};

export const getContractIndex = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  address: `0x${string}`
) => {
  try {
    const contract = { address, abi: tokenIndexABI };

    const info = await client.multicall({
      contracts: [
        { ...contract, functionName: "entryCount" },
        { ...contract, functionName: "owner" },
      ],
    });

    const entryCount = info?.[0].result ?? BigInt(0);
    const owner = info?.[1].result;

    const entries: Array<
      typeof contract & { functionName: "entry"; args: [bigint] }
    > = Array.from({ length: entryCount ? Number(entryCount) : 0 }, (_, i) => ({
      ...contract,
      functionName: "entry",
      args: [BigInt(i)],
    }));

    const contracts = await client.multicall({ contracts: entries });

    const contractAddresses = contracts.map(
      (response) => response.result as `0x${string}`
    );

    return { contractAddresses, owner, entryCount };
  } catch (error) {
    console.error("Error fetching contract index:", error);
    throw new Error("Failed to fetch contract index.");
  }
};

export const getPriceIndex = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  voucherAddress: `0x${string}`,
  contractAddress: `0x${string}`
) => {
  try {
    const contract = { address: contractAddress, abi: priceIndexQuoteAbi };
    const priceIndex = await client.readContract({
      ...contract,
      functionName: "priceIndex",
      args: [voucherAddress],
    });

    return priceIndex;
  } catch (error) {
    console.error("Error fetching price index:", error);
    throw new Error("Failed to fetch price index.");
  }
};

export const getLimitOf = async <chain extends Chain>(
  client: AppPublicClient<chain>,
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  contractAddress: `0x${string}`
) => {
  try {
    const contract = { address: contractAddress, abi: limiterAbi };

    const limitOf = await client.readContract({
      ...contract,
      functionName: "limitOf",
      args: [voucherAddress, swapPoolAddress],
    });

    return limitOf;
  } catch (error) {
    console.error("Error fetching limit:", error);
    throw new Error("Failed to fetch limit.");
  }
};

export async function getSwapPool<chain extends Chain>(
  client: AppPublicClient<chain>,
  swapPoolAddress: `0x${string}`,
  accountAddress?: `0x${string}`
) {
  try {
    const contract = { address: swapPoolAddress, abi: swapPoolAbi };

    const query = await client.multicall({
      contracts: [
        { ...contract, functionName: "owner" },
        { ...contract, functionName: "name" },
        { ...contract, functionName: "quoter" },
        { ...contract, functionName: "feeAddress" },
        { ...contract, functionName: "feePpm" },
        { ...contract, functionName: "tokenLimiter" },
        { ...contract, functionName: "tokenRegistry" },
      ],
    });

    const owner = query?.[0].result;
    const name = query?.[1].result;
    const quoter = query?.[2].result as `0x${string}` | undefined;
    const feeAddress = query?.[3].result;
    const feePpm = query?.[4].result;
    const tokenLimiter = query?.[5].result as `0x${string}` | undefined;
    const tokenRegistry = query?.[6].result as `0x${string}` | undefined;

    const tokenIndex = await getContractIndex(client, tokenRegistry!);
    const vouchers = tokenIndex.contractAddresses ?? [];
    const voucherDetails = await getMultipleSwapDetails(
      client,
      vouchers,
      quoter,
      swapPoolAddress,
      tokenLimiter,
      accountAddress
    );
    const feePercentage = feePpm ? Number(feePpm) / 10000 : 0;

    return {
      address: swapPoolAddress,
      tokenIndex,
      owner,
      name,
      quoter,
      feePercentage,
      feeAddress,
      feePpm,
      tokenLimiter,
      tokenRegistry,
      vouchers,
      voucherDetails,
    };
  } catch (error) {
    console.error("Error fetching swap pool details:", error);
    throw new Error("Failed to fetch swap pool details.");
  }
}

export const addPoolVoucher = async (
  config: Config,
  caller: `0x${string}`,
  voucherAddress: `0x${string}`,
  tokenIndexAddress: `0x${string}`
) => {
  const tx = await ownerWriteContract(config, caller, {
    ownedContract: tokenIndexAddress,
    ownedContractAbi: tokenIndexABI,
    functionName: "add",
    args: [voucherAddress],
  });
  return tx;
};

export const removePoolVoucher = async (
  config: Config,
  caller: `0x${string}`,
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`
) => {
  const tokenIndexAddress = await getSwapPoolTokenIndex(
    config,
    swapPoolAddress
  );
  const tx = await ownerWriteContract(config, caller, {
    ownedContract: tokenIndexAddress,
    ownedContractAbi: tokenIndexABI,
    functionName: "remove",
    args: [voucherAddress],
  });
  return tx;
};
export const setLimitFor = async (
  config: Config,
  caller: `0x${string}`,
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  limiterAddress: `0x${string}`,
  limit: bigint
) => {
  const tx = await ownerWriteContract(config, caller, {
    ownedContract: limiterAddress,
    ownedContractAbi: limiterAbi,
    functionName: "setLimitFor",
    args: [voucherAddress, swapPoolAddress, limit],
  });
  return tx;
};
export const getSwapPoolTokenIndex = async (
  config: Config,
  swapPoolAddress: `0x${string}`
) => {
  const contract = { address: swapPoolAddress, abi: swapPoolAbi };
  try {
    const tx = await readContract(config, {
      ...contract,
      functionName: "tokenRegistry",
    });
    return getAddress(tx) as `0x${string}`;
  } catch (error) {
    console.error("Error fetching swap pool token index:", error);
    throw new Error("Failed to fetch swap pool token index.");
  }
};
export const getSwapPoolTokenLimiter = async (
  config: Config,
  swapPoolAddress: `0x${string}`
) => {
  const contract = { address: swapPoolAddress, abi: swapPoolAbi };
  const tx = await readContract(config, {
    ...contract,
    functionName: "tokenLimiter",
  });
  return tx as `0x${string}`;
};

export const addWriterToTokenIndex = async (
  config: Config,
  caller: `0x${string}`,
  writerAddress: `0x${string}`,
  tokenIndexAddress: `0x${string}`
) => {
  const tx = await ownerWriteContract(config, caller, {
    ownedContract: tokenIndexAddress,
    ownedContractAbi: tokenIndexABI,
    functionName: "addWriter",
    args: [writerAddress],
  });
  return tx;
};
export const getSwapPoolQuoter = async (
  config: Config,
  swapPoolAddress: `0x${string}`
) => {
  const contract = { address: swapPoolAddress, abi: swapPoolAbi };
  const tx = await readContract(config, {
    ...contract,
    functionName: "quoter",
  });
  return tx as `0x${string}`;
};
export const setExchangeRate = async (
  config: Config,
  caller: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  voucherAddress: `0x${string}`,
  exchangeRate: bigint
) => {
  const quoter = await getSwapPoolQuoter(config, swapPoolAddress);
  const tx = await ownerWriteContract(config, caller, {
    ownedContract: quoter,
    ownedContractAbi: priceIndexQuoteAbi,
    functionName: "setPriceIndexValue",
    args: [voucherAddress, exchangeRate],
  });
  return tx;
};

export const addVoucherToPool = async (
  config: Config,
  caller: `0x${string}`,
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  limit: bigint,
  exchangeRate: bigint
) => {
  try {
    const tokenIndex = await getSwapPoolTokenIndex(config, swapPoolAddress);
    const tokenLimiter = await getSwapPoolTokenLimiter(config, swapPoolAddress);
    await addPoolVoucher(config, caller, voucherAddress, tokenIndex);
    // 1000000 = 10
    const txHash = await setLimitFor(
      config,
      caller,
      voucherAddress,
      swapPoolAddress,
      tokenLimiter,
      limit
    );
    await waitForTransactionReceipt(config, {
      hash: txHash,
      ...defaultReceiptOptions,
    });
    const txHash2 = await setExchangeRate(
      config,
      caller,
      swapPoolAddress,
      voucherAddress,
      exchangeRate
    );
    await waitForTransactionReceipt(config, {
      hash: txHash2,
      ...defaultReceiptOptions,
    });
    return;
  } catch (error) {
    console.error("Error adding voucher to pool:", error);
    throw new Error("Failed to add voucher to pool.");
  }
};

export const updatePoolVoucherLimit = async (
  config: Config,
  caller: `0x${string}`,
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  limit: bigint
) => {
  try {
    const tokenLimiter = await getSwapPoolTokenLimiter(config, swapPoolAddress);
    const txHash = await setLimitFor(
      config,
      caller,
      voucherAddress,
      swapPoolAddress,
      tokenLimiter,
      limit
    );
    await waitForTransactionReceipt(config, {
      hash: txHash,
      ...defaultReceiptOptions,
    });
    return txHash;
  } catch (error) {
    console.error("Error updating pool voucher limit:", error);
    throw new Error("Failed to update pool voucher limit.");
  }
};

export const updatePoolVoucherExchangeRate = async (
  config: Config,
  caller: `0x${string}`,
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  exchangeRate: bigint
) => {
  try {
    const txHash = await setExchangeRate(
      config,
      caller,
      swapPoolAddress,
      voucherAddress,
      exchangeRate
    );
    await waitForTransactionReceipt(config, {
      hash: txHash,
      ...defaultReceiptOptions,
    });
    return txHash;
  } catch (error) {
    console.error("Error updating pool voucher exchange rate:", error);
    throw new Error("Failed to update pool voucher exchange rate.");
  }
};

export const addQuoterIndexToSwapPool = async (
  config: Config,
  caller: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  quoterIndexAddress: `0x${string}`
) => {
  const tx = await ownerWriteContract(config, caller, {
    ownedContract: swapPoolAddress,
    ownedContractAbi: swapPoolAbi,
    functionName: "setQuoter",
    args: [quoterIndexAddress],
  });
  return tx;
};
