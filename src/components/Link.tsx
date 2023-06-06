import NextLink, { LinkProps } from "next/link";
import { forwardRef } from "react";

export const LinkBehaviour = forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkBehaviour(props, ref) {
    return <NextLink {...props} />;
  }
);
