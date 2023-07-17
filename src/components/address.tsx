import Link from "next/link";
import { useBreakpoint } from "~/hooks/useMediaQuery";
import { celoscanUrl } from "~/utils/celo";
import { truncateEthAddress } from "~/utils/dmr-helpers";

interface IAddressProps {
  address?: string;
  shrink?: boolean;
}

function Address(props: IAddressProps) {
  const md = useBreakpoint("lg");
  const address =
    md.isBelowLg && props.shrink
      ? truncateEthAddress(props.address)
      : props.address;
  return <Link href={celoscanUrl.address(props.address || "")}>{address}</Link>;
}

export default Address;
