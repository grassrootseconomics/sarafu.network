import { readContract, readContracts, writeContract } from "@wagmi/core";
import { erc20Abi } from "viem";
import { tokenIndexABI } from "@grassroots/contracts/erc20-token-index/contract";
import { limiterAbi } from "@grassroots/contracts/limiter/contract";
import { priceIndexQuoteAbi } from "@grassroots/contracts/price-index-quote/contract";
import { swapPoolAbi } from "@grassroots/contracts/swap-pool/contract";
import { config } from "@grassroots/shared/utils/web3";
import { getFormattedValue } from "~/utils/units";

export const getMultipleSwapDetails = async (
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

    const data = await readContracts(config, {
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

export const getContractIndex = async (address: `0x${string}`) => {
  try {
    const contract = { address, abi: tokenIndexABI };

    const info = await readContracts(config, {
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

    const contracts = await readContracts(config, { contracts: entries });

    const contractAddresses = contracts.map(
      (response) => response.result as `0x${string}`
    );

    return { contractAddresses, owner, entryCount };
  } catch (error) {
    console.error("Error fetching contract index:", error);
    throw new Error("Failed to fetch contract index.");
  }
};

export const getPriceIndex = async (
  voucherAddress: `0x${string}`,
  contractAddress: `0x${string}`
) => {
  try {
    const contract = { address: contractAddress, abi: priceIndexQuoteAbi };

    const priceIndex = await readContract(config, {
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

export const getLimitOf = async (
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  contractAddress: `0x${string}`
) => {
  try {
    const contract = { address: contractAddress, abi: limiterAbi };

    const limitOf = await readContract(config, {
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

export async function getSwapPool(
  swapPoolAddress: `0x${string}`,
  accountAddress?: `0x${string}`
) {
  try {
    const contract = { address: swapPoolAddress, abi: swapPoolAbi };

    const query = await readContracts(config, {
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
    const quoter = query?.[2].result;
    const feeAddress = query?.[3].result;
    const feePpm = query?.[4].result;
    const tokenLimiter = query?.[5].result;
    const tokenRegistry = query?.[6].result;

    const tokenIndex = await getContractIndex(tokenRegistry!);
    const vouchers = tokenIndex.contractAddresses ?? [];
    const voucherDetails = await getMultipleSwapDetails(
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
  voucherAddress: `0x${string}`,
  tokenIndexAddress: `0x${string}`
) => {
  const contract = { address: tokenIndexAddress, abi: tokenIndexABI };
  const tx = await writeContract(config, {
    ...contract,
    functionName: "add",
    args: [voucherAddress],
  });
  return tx;
};
export const setLimitFor = async (
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  limiterAddress: `0x${string}`,
  limit: bigint
) => {
  const contract = { address: limiterAddress, abi: limiterAbi };
  const tx = await writeContract(config, {
    ...contract,
    functionName: "setLimitFor",
    args: [voucherAddress, swapPoolAddress, limit],
  });
  return tx;
};
export const getSwapPoolTokenIndex = async (swapPoolAddress: `0x${string}`) => {
  const contract = { address: swapPoolAddress, abi: swapPoolAbi };
  try {
    const tx = await readContract(config, {
      ...contract,
      functionName: "tokenRegistry",
    });
    return tx;
  } catch (error) {
    console.error("Error fetching swap pool token index:", error);
    throw new Error("Failed to fetch swap pool token index.");
  }
};
export const getSwapPoolTokenLimiter = async (
  swapPoolAddress: `0x${string}`
) => {
  const contract = { address: swapPoolAddress, abi: swapPoolAbi };
  const tx = await readContract(config, {
    ...contract,
    functionName: "tokenLimiter",
  });
  return tx;
};

export const addWriterToTokenIndex = async (
  writerAddress: `0x${string}`,
  tokenIndexAddress: `0x${string}`
) => {
  const contract = { address: tokenIndexAddress, abi: tokenIndexABI };
  const tx = await writeContract(config, {
    ...contract,
    functionName: "addWriter",
    args: [writerAddress],
  });
  return tx;
};
export const getSwapPoolQuoter = async (swapPoolAddress: `0x${string}`) => {
  const contract = { address: swapPoolAddress, abi: swapPoolAbi };
  const tx = await readContract(config, {
    ...contract,
    functionName: "quoter",
  });
  return tx;
};
export const setExchangeRate = async (
  swapPoolAddress: `0x${string}`,
  voucherAddress: `0x${string}`,
  exchangeRate: bigint
) => {
  const quoter = await getSwapPoolQuoter(swapPoolAddress);
  const contract = { address: quoter, abi: priceIndexQuoteAbi };
  const tx = await writeContract(config, {
    ...contract,
    functionName: "setPriceIndexValue",
    args: [voucherAddress, exchangeRate],
  });
  return tx;
};
export const addVoucherToPool = async (
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  limit: bigint,
  exchangeRate: bigint
) => {
  try {
    const tokenIndex = await getSwapPoolTokenIndex(swapPoolAddress);
    const tokenLimiter = await getSwapPoolTokenLimiter(swapPoolAddress);
    await addPoolVoucher(voucherAddress, tokenIndex);
    // 1000000 = 10
    await setLimitFor(voucherAddress, swapPoolAddress, tokenLimiter, limit);
    await setExchangeRate(swapPoolAddress, voucherAddress, exchangeRate);
    return;
  } catch (error) {
    console.error("Error adding voucher to pool:", error);
    throw new Error("Failed to add voucher to pool.");
  }
};
export const updatePoolVoucher = async (
  voucherAddress: `0x${string}`,
  swapPoolAddress: `0x${string}`,
  limit: bigint,
  exchangeRate: bigint
) => {
  try {
    const tokenLimiter = await getSwapPoolTokenLimiter(swapPoolAddress);
    // 1000000 = 10
    await setLimitFor(voucherAddress, swapPoolAddress, tokenLimiter, limit);
    await setExchangeRate(swapPoolAddress, voucherAddress, exchangeRate);
    return;
  } catch (error) {
    console.error("Error adding voucher to pool:", error);
    throw new Error("Failed to add voucher to pool.");
  }
};
export const addQuoterIndexToSwapPool = async (
  swapPoolAddress: `0x${string}`,
  quoterIndexAddress: `0x${string}`
) => {
  const contract = { address: swapPoolAddress, abi: swapPoolAbi };
  const tx = await writeContract(config, {
    ...contract,
    functionName: "setQuoter",
    args: [quoterIndexAddress],
  });
  return tx;
};
