import { erc20Abi, formatUnits, isAddress, type Address } from "viem";
import { useReadContract } from "wagmi";
import { truncateByDecimalPlace } from "~/utils/number";

export function VoucherName({ address }: { address: string | undefined }) {
  const name = useReadContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: "name",
    query: {
      enabled: Boolean(address) && isAddress(address as string),
      staleTime: Infinity, // 30 days
    },
  });
  return <div>{name.data}</div>;
}

export function VoucherSymbol({ address }: { address: string | undefined }) {
  const name = useReadContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      enabled: Boolean(address) && isAddress(address as string),
      staleTime: Infinity, // 30 days
    },
  });
  return <div>{name.data}</div>;
}
export function VoucherValue({
  address,
  value,
}: {
  address: string | undefined;
  value: bigint | string;
}) {
  const decimals = useReadContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: Boolean(address) && isAddress(address as string),
      staleTime: Infinity, // 30 days
    },
  });
  const valueBigInt = typeof value === "bigint" ? value : BigInt(value);
  return (
    <div>
      {decimals.data
        ? truncateByDecimalPlace(formatUnits(valueBigInt, decimals.data), 2)
        : "-"}
    </div>
  );
}
