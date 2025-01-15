import { erc20Abi } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Skeleton } from "~/components/ui/skeleton";
import { getFormattedValue, toUserUnitsString } from "~/utils/units";

const useSymbol = ({ address }: { address: `0x${string}` }) => {
  return useReadContract({
    address: address,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  });
};

export const useName = ({ address }: { address: `0x${string}` }) => {
  return useReadContract({
    address: address,
    abi: erc20Abi,
    functionName: "name",
    query: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  });
};
const useDecimals = ({ address }: { address: `0x${string}` }) => {
  return useReadContract({
    address: address,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  });
};
export const useBalance = ({
  token,
  address,
}: {
  token: `0x${string}`;
  address?: `0x${string}`;
}) => {
  const decimals = useDecimals({ address: token });
  const balance = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });
  return {
    isLoading: balance.isLoading || decimals.isLoading,
    data: getFormattedValue(balance.data, decimals.data),
  };
};
export const Symbol = ({ address }: { address: `0x${string}` }) => {
  const { data: symbol, isLoading } = useSymbol({ address });
  if (isLoading) return <Skeleton className="h-4 w-full" />;
  return <>{symbol?.toUpperCase()}</>;
};

export const Decimals = ({ address }: { address: `0x${string}` }) => {
  const { data: decimals, isLoading } = useDecimals({ address });
  if (isLoading) return <Skeleton className="h-4 w-full" />;
  return <>{decimals}</>;
};

export const Name = ({ address }: { address: `0x${string}` }) => {
  const { data: name, isLoading } = useName({ address });
  if (isLoading) return <Skeleton className="h-4 w-full" />;
  return <>{name}</>;
};

export const Balance = ({
  token,
  address,
}: {
  token: `0x${string}`;
  address?: `0x${string}`;
}) => {
  const account = useAccount();
  const { data: balance, isLoading } = useBalance({
    address: address ?? account.address,
    token: token,
  });
  if (isLoading) return <Skeleton className="h-4 w-full" />;
  return <>{balance?.formatted}</>;
};

export const FormattedValue = ({
  address,
  value,
}: {
  address: `0x${string}`;
  value: string;
}) => {
  const { data: decimals } = useDecimals({ address });
  if (!decimals) return null;
  return <>{toUserUnitsString(BigInt(value), decimals)}</>;
};
