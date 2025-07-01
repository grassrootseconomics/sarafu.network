"use client";

import { ParagraphPlugin, Plate } from "platejs/react";
import { useRef } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";

import { KEYS } from "platejs";
import { ImagePlugin } from "@platejs/media/react";
import { Value } from "platejs";
import { DndProvider } from "react-dnd";
import { useCreateEditor } from "~/components/editor/use-create-editor";
import { FixedToolbar } from "~/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "~/components/plate-ui/fixed-toolbar-buttons";
import { CursorOverlay } from "~/components/ui/cursor-overlay";
import { Editor } from "~/components/ui/editor";
import { TooltipProvider } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { CloudImagePlugin } from "./plugins/cloud-plugin/image/CloudImagePlugin";
import {
  FieldReportFormPlugin,
  TFieldReportElement,
} from "./plugins/field-report-plugin";
export type TParagraphElement = {
  type: "paragraph";
  children: { text: string }[];
  align?: "left" | "center" | "right";
};

export default function PlateEditor({
  initialValue,
  onChange,
  disabled,
}: {
  initialValue: string;
  onChange?: (
    content: string,
    heading: string | null,
    image: string | null,
    description: string | null
  ) => void;
  disabled: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useCreateEditor({
    value: JSON.parse(initialValue) as unknown as Value,
  });

  return (
    <TooltipProvider
      disableHoverableContent
      delayDuration={500}
      skipDelayDuration={0}
    >
      <DndProvider backend={HTML5Backend}>
        <Plate
          editor={editor}
          readOnly={disabled}
          onChange={
            onChange
              ? (editor) => {
                  const content = JSON.stringify(editor.value);
                  // Extract first h1 element
                  const heading =
                    (editor.value.find((node) => node.type === KEYS.h1)
                      ?.children?.[0]?.text as string) || null;

                  // Extract first image element
                  const image =
                    (editor.value.find(
                      (node) =>
                        node.type === ImagePlugin.key ||
                        node.type === CloudImagePlugin.key
                    )?.url as string) || null;

                  let description = (
                    editor.value.find(
                      (node) => node.type === FieldReportFormPlugin.key
                    ) as TFieldReportElement
                  )?.formData?.description;

                  if (!description) {
                    description = (
                      editor.value.find(
                        (node) => node.type === ParagraphPlugin.key
                      ) as TParagraphElement
                    )?.children.reduce(
                      (acc, child) =>
                        typeof child?.text === "string"
                          ? acc + child.text
                          : acc,
                      ""
                    );
                  }
                  onChange(content, heading, image, description);
                }
              : undefined
          }
        >
          <div
            ref={containerRef}
            className={cn(
              "relative",
              // Block selection
              "[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4"
            )}
          >
            {disabled ? null : (
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
            )}

            <Editor className="py-6" autoFocus variant="ghost" />
            <CursorOverlay />
          </div>
        </Plate>
      </DndProvider>
    </TooltipProvider>
  );
}
