/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn, withRef } from "@udecode/cn";
import { getHandler, IS_APPLE } from "@udecode/plate-common";
import { useElement } from "@udecode/plate-common/react";
import React from "react";
import { useFocused, useSelected } from "slate-react";

import { useMounted } from "~/hooks/use-mounted";

import { PlateElement } from "./plate-element";

import type { TMentionElement } from "@udecode/plate-mention";

type MentionElementProps = {
  prefix?: string;
  renderLabel?: (mentionable: TMentionElement) => string;
  onClick?: (mentionNode: any) => void;
};
export const MentionElement = withRef<typeof PlateElement, MentionElementProps>(
  ({ children, className, prefix, renderLabel, onClick, ...props }, ref) => {
    const element = useElement<TMentionElement>();
    const selected = useSelected();
    const focused = useFocused();
    const mounted = useMounted();
    return (
      <PlateElement
        ref={ref}
        className={cn(
          "inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium",
          selected && focused && "ring-2 ring-ring",
          element.children[0]?.bold === true && "font-bold",
          element.children[0]?.italic === true && "italic",
          element.children[0]?.underline === true && "underline",
          className
        )}
        onClick={getHandler(onClick, element)}
        data-slate-value={element.value}
        contentEditable={false}
        {...props}
      >
        {mounted && IS_APPLE ? (
          // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
          <React.Fragment>
            {children}
            {prefix}
            {renderLabel ? renderLabel(element) : element.value}
          </React.Fragment>
        ) : (
          // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
          <React.Fragment>
            {prefix}
            {renderLabel ? renderLabel(element) : element.value}
            {children}
          </React.Fragment>
        )}
      </PlateElement>
    );
  }
);
