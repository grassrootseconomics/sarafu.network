"use client";

import type { TLinkElement } from "@udecode/plate-link";
import type { PlateElementProps } from "@udecode/plate/react";

import { useLink } from "@udecode/plate-link/react";
import { PlateElement } from "@udecode/plate/react";

export function LinkElement(props: PlateElementProps<TLinkElement>) {
  const { props: linkProps } = useLink({ element: props.element });

  return (
    <PlateElement
      {...props}
      as="a"
      className="font-medium text-primary underline decoration-primary underline-offset-4"
      // @ts-expect-error - TODO: fix this
      attributes={{
        ...props.attributes,
        ...linkProps,
      }}
    >
      {props.children}
    </PlateElement>
  );
}
