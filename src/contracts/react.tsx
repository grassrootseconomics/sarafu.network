import { erc20Abi } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Skeleton } from "~/components/ui/skeleton";
import { toUserUnitsString } from "~/utils/units";

const useSymbol = ({ address }: { address: `0x${string}` }) => {
  return useReadContract({
    address: address,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      staleTime: Infinity,
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
    },
  });
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

export const Balance = ({ address }: { address: `0x${string}` }) => {
  const account = useAccount();
  const { data: balance, isLoading } = useBalance({
    address: account.address,
    token: address,
    query: {
      enabled: !!account,
    },
  });
  if (isLoading) return <Skeleton className="h-4 w-full" />;
  return <>{toUserUnitsString(balance?.value, balance?.decimals)}</>;
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
