"use client"
import { erc20Abi } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { abi } from "~/contracts/erc20-giftable-token/contract";
import { getFormattedValue, type TokenValue } from "~/utils/units";

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
      ? getFormattedValue(query.data?.[4].result, decimals)
      : undefined;
  return { decimals, symbol, name, totalSupply, query, balance };
};

export const useMultiVoucherBalances = (
  voucherAddresses: `0x${string}`[],
  balanceOfAddress: `0x${string}` | undefined
): Record<`0x${string}`, TokenValue | undefined> => {
  const getContractCalls = (voucherAddress: `0x${string}`) => {
    const contract = { address: voucherAddress, abi: erc20Abi } as const;
    return [
      {
        ...contract,
        functionName: "decimals",
      },
      {
        ...contract,
        functionName: "balanceOf",
        args: [balanceOfAddress],
      },
    ];
  };
  const contracts = voucherAddresses.map((voucherAddress) => {
    return getContractCalls(voucherAddress);
  });
  const contractsFlat = contracts.flat();
  const query = useReadContracts({
    contracts: contractsFlat,
    query: {
      enabled: Boolean(balanceOfAddress),
    },
  });
  const result: Record<`0x${string}`, TokenValue | undefined> = {};
  query.data?.forEach((data, index) => {
    if (index % 2 === 0) {
      const decimals = data.result as number;
      const balance = query.data?.[index + 1]?.result as bigint;
      const contractAddress = contractsFlat[index]?.address;

      if (balance && decimals && contractAddress) {
        result[contractAddress] = getFormattedValue(balance, decimals);
      }
    }
  });
  return result;
};


export const useExpiryPeriod = (address: `0x${string}`) => {
  const query = useReadContract({
    abi: abi,
    address: address,
    // Returns Unix Epoch
    functionName: "expires"
  })
  return  {
    expires: query.data ? new Date(Number(query.data) * 1000) : undefined,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
export const useMultiAccountBalances = (
  balanceOfAddresses: `0x${string}`[],
  voucherAddress: `0x${string}`
): Record<`0x${string}`, TokenValue | undefined> => {
  const getContractCalls = (balanceOf: `0x${string}`) => {
    const contract = { address: voucherAddress, abi: erc20Abi } as const;
    return [
      {
        ...contract,
        functionName: "decimals",
      },
      {
        ...contract,
        functionName: "balanceOf",
        args: [balanceOf],
      },
    ];
  };
  const contracts = balanceOfAddresses.map((balanceOfAddress) => {
    return getContractCalls(balanceOfAddress);
  });
  const contractsFlat = contracts.flat();
  const query = useReadContracts({
    contracts: contractsFlat,
    query: {
      enabled: Boolean(voucherAddress),
    },
  });
  const result: Record<`0x${string}`, TokenValue | undefined> = {};
  query.data?.forEach((data, index) => {
    if (index % 2 === 0) {
      const decimals = data.result as number;
      const balance = query.data?.[index + 1]?.result as bigint;
      const balanceOfAddress = balanceOfAddresses[index / 2];
      if (balance && decimals && balanceOfAddress) {
        result[balanceOfAddress] = getFormattedValue(balance, decimals);
      }
    }
  });
  return result;
};
