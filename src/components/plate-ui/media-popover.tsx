import { isSelectionExpanded } from "@udecode/plate-common";
import {
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
} from "@udecode/plate-common/react";
import {
  floatingMediaActions,
  FloatingMedia as FloatingMediaPrimitive,
  useFloatingMediaSelectors,
} from "@udecode/plate-media/react";
import React, { useEffect } from "react";
import { useReadOnly, useSelected } from "slate-react";

import { Icons } from "~/components/icons";

import { Button, buttonVariants } from "./button";
import { CaptionButton } from "./caption";
import { inputVariants } from "./input";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Separator } from "./separator";

import type { WithRequiredKey } from "@udecode/plate-common";

export interface MediaPopoverProps {
  children: React.ReactNode;
  plugin: WithRequiredKey;
}

export function MediaPopover({ children, plugin }: MediaPopoverProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();

  const selectionCollapsed = useEditorSelector(
    (editor) => !isSelectionExpanded(editor),
    []
  );
  const isOpen = !readOnly && selected && selectionCollapsed;
  const isEditing = useFloatingMediaSelectors().isEditing();

  useEffect(() => {
    if (!isOpen && isEditing) {
      floatingMediaActions.isEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });

  if (readOnly) return <>{children}</>;

  return (
    <Popover modal={false} open={isOpen}>
      <PopoverAnchor>{children}</PopoverAnchor>

      <PopoverContent
        className="w-auto p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isEditing ? (
          <div className="flex w-[330px] flex-col">
            <div className="flex items-center">
              <div className="flex items-center pl-3 text-muted-foreground">
                <Icons.link className="size-4" />
              </div>

              <FloatingMediaPrimitive.UrlInput
                className={inputVariants({ h: "sm", variant: "ghost" })}
                options={{ plugin }}
                placeholder="Paste the embed link..."
              />
            </div>
          </div>
        ) : (
          <div className="box-content flex h-9 items-center gap-1">
            <FloatingMediaPrimitive.EditButton
              className={buttonVariants({ size: "sm", variant: "ghost" })}
            >
              Edit link
            </FloatingMediaPrimitive.EditButton>

            <CaptionButton variant="ghost">Caption</CaptionButton>

            <Separator className="my-1" orientation="vertical" />

            <Button size="sms" variant="ghost" {...buttonProps}>
              <Icons.delete className="size-4" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
