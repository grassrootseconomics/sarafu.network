"use client";

import type { SlateRenderElementProps } from "platejs";

import {
  useTodoListElement,
  useTodoListElementState,
} from "@platejs/list/react";
import { useReadOnly } from "platejs/react";

import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";

export function TodoMarker(props: Omit<SlateRenderElementProps, "children">) {
  const state = useTodoListElementState({ element: props.element });
  const { checkboxProps } = useTodoListElement(state);
  const readOnly = useReadOnly();

  return (
    <div contentEditable={false}>
      <Checkbox
        className={cn(
          "absolute top-1 -left-6",
          readOnly && "pointer-events-none"
        )}
        {...checkboxProps}
      />
    </div>
  );
}

export function TodoLi(props: SlateRenderElementProps) {
  return (
    <li
      className={cn(
        "list-none",
        (props.element.checked as boolean) &&
          "text-muted-foreground line-through"
      )}
    >
      {props.children}
    </li>
  );
}
