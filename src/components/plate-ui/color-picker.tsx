"use client";

import { cn, withRef } from "@udecode/cn";
import React, { type Ref } from "react";

import { buttonVariants } from "./button";
import { ColorDropdownMenuItems } from "./color-dropdown-menu-items";
import { ColorsCustom } from "./colors-custom";
import { DropdownMenuItem } from "./dropdown-menu";
import { Separator } from "./separator";

import type { TColor } from "./color-dropdown-menu";

export const ColorPickerContent = withRef<
  // @ts-expect-error - TODO: fix this
  "div",
  {
    clearColor: () => void;
    color?: string;
    colors: TColor[];
    customColors: TColor[];
    updateColor: (color: string) => void;
    updateCustomColor: (color: string) => void;
  }
>(
  (
    {
      className,
      clearColor,
      color,
      colors,
      customColors,
      updateColor,
      updateCustomColor,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn("flex flex-col gap-4 p-4", className)}
        ref={ref as Ref<HTMLDivElement>}
        {...props}
      >
        <ColorsCustom
          color={color}
          colors={colors}
          customColors={customColors}
          updateColor={updateColor}
          updateCustomColor={updateCustomColor}
        />

        <Separator />

        <ColorDropdownMenuItems
          color={color}
          colors={colors}
          updateColor={updateColor}
        />
        {color && (
          <DropdownMenuItem
            className={buttonVariants({
              isMenu: true,
              variant: "outline",
            })}
            onClick={clearColor}
          >
            Clear
          </DropdownMenuItem>
        )}
      </div>
    );
  }
);

export const ColorPicker = React.memo(
  ColorPickerContent,
  (prev, next) =>
    prev.color === next.color &&
    prev.colors === next.colors &&
    prev.customColors === next.customColors
);
