/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { cn } from "@udecode/cn";
import {
  useCommentLeaf,
  useCommentLeafState,
} from "@udecode/plate-comments/react";
import { PlateLeaf } from "@udecode/plate-common/react";

import type { TCommentText } from "@udecode/plate-comments";
import type { PlateLeafProps } from "@udecode/plate-common/react";

export function CommentLeaf({
  className,
  ...props
}: PlateLeafProps<TCommentText>) {
  const { children, leaf, nodeProps } = props;

  const state = useCommentLeafState({ leaf });
  const { props: rootProps } = useCommentLeaf(state);

  if (!state.commentCount) return <>{children}</>;

  let aboveChildren = <>{children}</>;

  if (!state.isActive) {
    for (let i = 1; i < state.commentCount; i++) {
      aboveChildren = <span className="bg-highlight/25">{aboveChildren}</span>;
    }
  }

  return (
    <PlateLeaf
      {...props}
      className={cn(
        "border-b-2 border-b-highlight/35 hover:bg-highlight/25",
        state.isActive ? "bg-highlight/25" : "bg-highlight/15",
        className
      )}
      nodeProps={{
        ...rootProps,
        ...nodeProps,
      }}
    >
      {aboveChildren}
    </PlateLeaf>
  );
}
