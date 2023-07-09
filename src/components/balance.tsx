import { useBalance } from "wagmi";

interface IBalanceProps {
  tokenAddress: string;
  address: string;
}

function Balance(props: IBalanceProps) {
  const { data: balance } = useBalance({
    token: props.tokenAddress as `0x${string}`,
    address: props.address as `0x${string}`,
  });
  return <>{balance?.formatted ?? 0}</>;
}

export default Balance;
