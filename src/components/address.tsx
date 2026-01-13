"use client";
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
  href?: string;
  /** Render as span instead of link (use when nested inside another link) */
  asSpan?: boolean;
}

function Address(props: IAddressProps) {
  const md = useBreakpoint("lg");
  const address =
    (md.isBelowLg && props.truncate) || props.forceTruncate
      ? truncateEthAddress(props.address)
      : props.address;
  const { data: ens } = useENS({
    address: props.address as `0x${string}`,
    disabled: props.disableENS,
  });

  const displayText =
    ens?.name && !Boolean(props.disableENS) ? ens?.name : address;

  if (props.asSpan) {
    return <span className={props?.className}>{displayText}</span>;
  }

  return (
    <Link
      target="_blank"
      className={props?.className}
      href={props.href || celoscanUrl.address(props.address || "")}
    >
      {displayText}
    </Link>
  );
}

export default Address;
