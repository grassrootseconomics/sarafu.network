import { isAddress } from "viem";
import { useBalance } from "wagmi";
import { toUserUnitsString } from "~/utils/units";

interface IBalanceProps {
  tokenAddress?: string;
  address?: string;
}

function Balance(props: IBalanceProps) {
  const { data: balance } = useBalance({
    token: props.tokenAddress as `0x${string}`,
    address: props.address as `0x${string}`,
    query: {
      enabled: Boolean(
        props.tokenAddress &&
          props.address &&
          isAddress(props.tokenAddress) &&
          isAddress(props.address)
      ),
    },
  });
  return <>{toUserUnitsString(balance?.value, balance?.decimals)}</>;
}

export default Balance;
