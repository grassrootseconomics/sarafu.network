import Link from "next/link";
import { useBreakpoint } from "~/hooks/useMediaQuery";
import { useENS } from "~/lib/sarafu/resolver";
import { celoscanUrl } from "~/utils/celo";
import { truncateEthAddress } from "~/utils/dmr-helpers";

interface IAddressProps {
  address?: string;
  className?: string;
  truncate?: boolean;
  forceTruncate?: boolean;
  disableENS?: boolean;
}

function Address(props: IAddressProps) {
  const md = useBreakpoint("lg");
  const address =
    (md.isBelowLg && props.truncate) || props.forceTruncate
      ? truncateEthAddress(props.address)
      : props.address;
  const { data: ens } = useENS({
    address: props.address as `0x${string}`,
  });
  return (
    <Link
      target="_blank"
      className={props?.className}
      href={celoscanUrl.address(props.address || "")}
    >
      {ens?.name ?? address}
    </Link>
  );
}

export default Address;
