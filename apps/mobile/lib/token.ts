import { useEffect, useState } from "react";
import { erc20Abi, formatUnits, type Address } from "viem";
import { publicClient } from "./chain";
import { trpc } from "./trpc";

export interface VoucherBalance {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  icon_url: string | null;
  balance: bigint;
}

export function formatTokenAmount(value: bigint, decimals: number): string {
  const formatted = formatUnits(value, decimals);
  // Remove trailing zeros after decimal
  const [whole, frac] = formatted.split(".");
  if (!frac || frac === "0".repeat(frac.length)) return whole!;
  return `${whole}.${frac.replace(/0+$/, "")}`;
}

export function useVoucherBalances(userAddress: string | null) {
  const { data: vouchers, isLoading: vouchersLoading } =
    trpc.me.vouchers.useQuery(undefined, { enabled: !!userAddress });

  const [balances, setBalances] = useState<VoucherBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);

  useEffect(() => {
    if (!vouchers?.length || !userAddress) {
      setBalances([]);
      return;
    }

    let cancelled = false;
    setBalancesLoading(true);

    // Build multicall: for each voucher, read both balanceOf and decimals
    const contracts = vouchers.flatMap((v) => [
      {
        address: v.voucher_address as Address,
        abi: erc20Abi,
        functionName: "balanceOf" as const,
        args: [userAddress as Address] as const,
      },
      {
        address: v.voucher_address as Address,
        abi: erc20Abi,
        functionName: "decimals" as const,
        args: [] as const,
      },
    ]);

    publicClient
      .multicall({ contracts })
      .then((results) => {
        if (cancelled) return;
        const mapped: VoucherBalance[] = vouchers.map((v, i) => {
          const balResult = results[i * 2];
          const decResult = results[i * 2 + 1];
          return {
            address: v.voucher_address as Address,
            name: v.voucher_name,
            symbol: v.symbol,
            decimals:
              decResult?.status === "success"
                ? Number(decResult.result)
                : 18,
            icon_url: v.icon_url,
            balance:
              balResult?.status === "success"
                ? (balResult.result as bigint)
                : 0n,
          };
        });
        setBalances(mapped);
        setBalancesLoading(false);
      })
      .catch(() => {
        if (!cancelled) setBalancesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vouchers, userAddress]);

  return {
    vouchers: balances,
    isLoading: vouchersLoading || balancesLoading,
    refetch: () => {
      // Trigger re-fetch by clearing and letting effect re-run
      setBalances([]);
    },
  };
}
