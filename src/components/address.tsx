"use client";
import Link from "next/link";
import { useBreakpoint } from "~/hooks/use-media-query";
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
  /** Where to link: "profile" (internal /users page, default) or "explorer" (CeloScan) */
  linkTo?: "profile" | "explorer";
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

  const defaultHref =
    props.linkTo === "explorer"
      ? celoscanUrl.address(props.address || "")
      : `/users/${props.address}`;

  const href = props.href || defaultHref;
  const isExternal =
    props.linkTo === "explorer" || props.href?.startsWith("http");

  return (
    <Link
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={props?.className}
      href={href}
    >
      {displayText}
    </Link>
  );
}

export default Address;
