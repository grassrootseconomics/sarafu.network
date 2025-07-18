"use client";

import * as React from "react";

import { DndPlugin } from "@platejs/dnd";
import { useBlockSelected } from "@platejs/selection/react";
import { type VariantProps, cva } from "class-variance-authority";
import { usePluginOption } from "platejs/react";

import { cn } from "~/lib/utils";

export const blockSelectionVariants = cva(
  "pointer-events-none absolute inset-0 z-1 bg-brand/[.13] transition-opacity",
  {
    defaultVariants: {
      active: true,
    },
    variants: {
      active: {
        false: "opacity-0",
        true: "opacity-100",
      },
    },
  }
);

export function BlockSelection({
  className,
  active: _variantActive,
  ...divElementProps
}: React.ComponentProps<"div"> & VariantProps<typeof blockSelectionVariants>) {
  const isBlockSelected = useBlockSelected() as boolean;
  const isDragging = usePluginOption(DndPlugin, "isDragging") ?? false;

  if (!isBlockSelected) return null;

  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      className={cn(
        blockSelectionVariants({
          active: isBlockSelected && !isDragging,
        }),
        className
      )}
      data-slot="block-selection"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      {...divElementProps}
    />
  );
}
