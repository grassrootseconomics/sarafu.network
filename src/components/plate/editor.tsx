/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { cn, withProps } from "@udecode/cn";
import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { type Value } from "@udecode/plate-common";
import {
  ParagraphPlugin,
  Plate,
  PlateLeaf,
  usePlateEditor,
} from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";
import { useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { BlockquoteElement } from "~/components/plate-ui/blockquote-element";
import { CloudAttachmentElement } from "~/components/plate-ui/cloud-attachment-element";
import { CloudImageElement } from "~/components/plate-ui/cloud-image-element";
import { CursorOverlay } from "~/components/plate-ui/cursor-overlay";
import { Editor } from "~/components/plate-ui/editor";
import { FixedToolbar } from "~/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "~/components/plate-ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "~/components/plate-ui/floating-toolbar";
import { FloatingToolbarButtons } from "~/components/plate-ui/floating-toolbar-buttons";
import { HeadingElement } from "~/components/plate-ui/heading-element";
import { HrElement } from "~/components/plate-ui/hr-element";
import { ImageElement } from "~/components/plate-ui/image-element";
import { LinkElement } from "~/components/plate-ui/link-element";
import { MediaEmbedElement } from "~/components/plate-ui/media-embed-element";
import { ParagraphElement } from "~/components/plate-ui/paragraph-element";
import { withPlaceholders } from "~/components/plate-ui/placeholder";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "~/components/plate-ui/table-cell-element";
import { TableElement } from "~/components/plate-ui/table-element";
import { TableRowElement } from "~/components/plate-ui/table-row-element";
import { TooltipProvider } from "~/components/plate-ui/tooltip";
import { withDraggables } from "~/components/plate-ui/with-draggables";
import { CloudAttachmentPlugin } from "~/components/plate/cloud-plugin/attachment/CloudAttachmentPlugin";
import { CloudImagePlugin } from "~/components/plate/cloud-plugin/image/CloudImagePlugin";
import { type MyParagraphElement } from "~/lib/plate/plate-types";
import {
  FieldReportFormPlugin,
  type TFieldReportElement,
} from "./field-report-plugin";
import { plugins } from "./plugins";

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
  const containerRef = useRef(null);

  const editor = useMyEditor(initialValue);

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
                    (editor.value.find((node) => node.type === HEADING_KEYS.h1)
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
                      ) as MyParagraphElement
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

            <Editor
              className="py-6"
              autoFocus
              focusRing={false}
              variant="ghost"
            />

            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>
            <CursorOverlay containerRef={containerRef} />
          </div>
        </Plate>
      </DndProvider>
    </TooltipProvider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const components = withDraggables(
  withPlaceholders({
    [CloudImagePlugin.key]: CloudImageElement,
    [CloudAttachmentPlugin.key]: CloudAttachmentElement,
    [BlockquotePlugin.key]: BlockquoteElement,
    [HorizontalRulePlugin.key]: HrElement,
    [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
    [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
    [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
    [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: "h4" }),
    [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: "h5" }),
    [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: "h6" }),
    [ImagePlugin.key]: ImageElement,
    [LinkPlugin.key]: LinkElement,
    [MediaEmbedPlugin.key]: MediaEmbedElement,
    [ParagraphPlugin.key]: ParagraphElement,
    [TablePlugin.key]: TableElement,
    [TableRowPlugin.key]: TableRowElement,
    [TableCellPlugin.key]: TableCellElement,
    [TableCellHeaderPlugin.key]: TableCellHeaderElement,
    [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
    [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
    [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" }),
  })
);

export const useMyEditor = (initialValue: Value | string) => {
  return usePlateEditor({
    plugins: plugins,
    override: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      components: components,
    },
    value:
      typeof initialValue === "string"
        ? (JSON.parse(initialValue) as Value)
        : initialValue,
  });
};
