import Link from "next/link";
import { celoscanUrl } from "@grassroots/shared/utils/celo";

import { useBreakpoint } from "~/hooks/useMediaQuery";
import { truncateEthAddress } from "~/utils/dmr-helpers";

interface IAddressProps {
  address?: string;
  className?: string;
  truncate?: boolean;
  forceTruncate?: boolean;
}

function Address(props: IAddressProps) {
  const md = useBreakpoint("lg");
  const address =
    (md.isBelowLg && props.truncate) || props.forceTruncate
      ? truncateEthAddress(props.address)
      : props.address;
  return (
    <Link
      target="_blank"
      className={props?.className}
      href={celoscanUrl.address(props.address || "")}
    >
      {address}
    </Link>
  );
}

export default Address;
