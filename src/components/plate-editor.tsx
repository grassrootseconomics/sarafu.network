/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { cn, withProps } from "@udecode/cn";
import { AlignPlugin } from "@udecode/plate-alignment/react";
import { AutoformatPlugin } from "@udecode/plate-autoformat/react";
import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { ExitBreakPlugin, SoftBreakPlugin } from "@udecode/plate-break/react";
import { CaptionPlugin } from "@udecode/plate-caption/react";
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from "@udecode/plate-code-block";
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@udecode/plate-code-block/react";
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  someNode,
  type Value,
} from "@udecode/plate-common";
import {
  ParagraphPlugin,
  Plate,
  PlateLeaf,
  usePlateEditor,
} from "@udecode/plate-common/react";
import { DndPlugin } from "@udecode/plate-dnd";
import { DocxPlugin } from "@udecode/plate-docx";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
import { FontColorPlugin, FontSizePlugin } from "@udecode/plate-font/react";
import { HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { JuicePlugin } from "@udecode/plate-juice";
import { LineHeightPlugin } from "@udecode/plate-line-height/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import { TodoListPlugin } from "@udecode/plate-list/react";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { ResetNodePlugin } from "@udecode/plate-reset-node/react";
import { SelectOnBackspacePlugin } from "@udecode/plate-select";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { TabbablePlugin } from "@udecode/plate-tabbable/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";
import { useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { BlockquoteElement } from "~/components/plate-ui/blockquote-element";
import {
  CursorOverlay,
  DragOverCursorPlugin,
} from "~/components/plate-ui/cursor-overlay";
import { Editor } from "~/components/plate-ui/editor";
import { FixedToolbar } from "~/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "~/components/plate-ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "~/components/plate-ui/floating-toolbar";
import { FloatingToolbarButtons } from "~/components/plate-ui/floating-toolbar-buttons";
import { HeadingElement } from "~/components/plate-ui/heading-element";
import { HrElement } from "~/components/plate-ui/hr-element";
import {
  TodoLi,
  TodoMarker,
} from "~/components/plate-ui/indent-todo-marker-component";
import { LinkElement } from "~/components/plate-ui/link-element";
import { LinkFloatingToolbar } from "~/components/plate-ui/link-floating-toolbar";
import { MediaEmbedElement } from "~/components/plate-ui/media-embed-element";
import { ParagraphElement } from "~/components/plate-ui/paragraph-element";
import { withPlaceholders } from "~/components/plate-ui/placeholder";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "~/components/plate-ui/table-cell-element";
import { TableElement } from "~/components/plate-ui/table-element";
import { TableRowElement } from "~/components/plate-ui/table-row-element";
import { withDraggables } from "~/components/plate-ui/with-draggables";
import { autoformatRules } from "~/lib/plate/autoformat-rules";
import { CloudAttachmentElement } from "./plate-ui/cloud-attachment-element";
import { CloudImageElement } from "./plate-ui/cloud-image-element";
import { ImageElement } from "./plate-ui/image-element";
import { TooltipProvider } from "./plate-ui/tooltip";
import { CloudAttachmentPlugin } from "./plate/attachment/CloudAttachmentPlugin";
import { CloudPlugin } from "./plate/cloud/CloudPlugin";
import { CloudImagePlugin } from "./plate/image/CloudImagePlugin";

export default function PlateEditor({
  initialValue,
  onChange,
  disabled,
}: {
  initialValue: string;
  onChange: (value: string) => void;
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
          onChange={(editor) => {
            console.log(editor.value);
            const content = JSON.stringify(editor.value);
            onChange(content);
          }}
        >
          <div
            ref={containerRef}
            className={cn(
              "relative",
              // Block selection
              "[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4"
            )}
          >
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>

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
const plugins = [
  CloudPlugin.configure({
    options: {},
  }),
  CloudImagePlugin.configure({
    options: {
      maxInitialHeight: 1000,
      maxInitialWidth: 1000,
    },
  }),
  CloudAttachmentPlugin.configure({
    options: {},
  }),
  // Nodes
  HeadingPlugin,
  BlockquotePlugin,
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
  HorizontalRulePlugin,
  LinkPlugin.configure({
    render: { afterEditable: () => <LinkFloatingToolbar /> },
  }),
  ImagePlugin,
  MediaEmbedPlugin,
  CaptionPlugin.configure({
    options: { plugins: [ImagePlugin, CloudImagePlugin, MediaEmbedPlugin] },
  }),
  TablePlugin,
  TableRowPlugin,
  TableCellPlugin,
  TableCellHeaderPlugin,
  // Marks
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  FontColorPlugin,
  FontSizePlugin,
  // Block Style
  AlignPlugin.configure({
    inject: {
      targetPlugins: [ParagraphPlugin.key, ...HEADING_LEVELS],
    },
  }),
  IndentPlugin.configure({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        BlockquotePlugin.key,
        CodeBlockPlugin.key,
        ...HEADING_LEVELS,
      ],
    },
  }),
  IndentListPlugin.configure({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        BlockquotePlugin.key,
        CodeBlockPlugin.key,
        ...HEADING_LEVELS,
      ],
    },
    options: {
      listStyleTypes: {
        todo: {
          liComponent: TodoLi,
          markerComponent: TodoMarker,
          type: "todo",
        },
      },
    },
  }),
  LineHeightPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 1.5,
        validNodeValues: [1, 1.2, 1.5, 2, 3],
      },
      targetPlugins: [ParagraphPlugin.key, ...HEADING_LEVELS],
    },
  }),

  // Functionality
  AutoformatPlugin.configure({
    options: {
      rules: autoformatRules,
      enableUndoOnDelete: true,
    },
  }),
  BlockSelectionPlugin.configure({
    options: {
      areaOptions: {
        behaviour: {
          scrolling: {
            startScrollMargins: { x: 0, y: 0 },
          },
        },
        boundaries: "#scroll_container",
        container: "#scroll_container",
        selectables: "#scroll_container .slate-selectable",
        selectionAreaClass: "slate-selection-area",
      },
      enableContextMenu: true,
    },
  }),
  DndPlugin.configure({
    options: { enableScroller: true },
  }),
  EmojiPlugin,
  ExitBreakPlugin.configure({
    options: {
      rules: [
        {
          hotkey: "mod+enter",
        },
        {
          hotkey: "mod+shift+enter",
          before: true,
        },
        {
          hotkey: "enter",
          query: {
            start: true,
            end: true,
            allow: HEADING_LEVELS,
          },
          relative: true,
          level: 1,
        },
      ],
    },
  }),
  NodeIdPlugin,
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          types: [BlockquotePlugin.key, TodoListPlugin.key as string],
          defaultType: ParagraphPlugin.key,
          hotkey: "Enter",
          predicate: isBlockAboveEmpty,
        },
        {
          types: [BlockquotePlugin.key, TodoListPlugin.key as string],
          defaultType: ParagraphPlugin.key,
          hotkey: "Backspace",
          predicate: isSelectionAtBlockStart,
        },
        {
          types: [CodeBlockPlugin.key],
          defaultType: ParagraphPlugin.key,
          onReset: unwrapCodeBlock,
          hotkey: "Enter",
          predicate: isCodeBlockEmpty,
        },
        {
          types: [CodeBlockPlugin.key],
          defaultType: ParagraphPlugin.key,
          onReset: unwrapCodeBlock,
          hotkey: "Backspace",
          predicate: isSelectionAtCodeBlockStart,
        },
      ],
    },
  }),
  SelectOnBackspacePlugin.configure({
    options: {
      query: {
        allow: [ImagePlugin.key, HorizontalRulePlugin.key],
      },
    },
  }),
  SoftBreakPlugin.configure({
    options: {
      rules: [
        { hotkey: "shift+enter" },
        {
          hotkey: "enter",
          query: {
            allow: [
              CodeBlockPlugin.key,
              BlockquotePlugin.key,
              TableCellPlugin.key,
              TableCellHeaderPlugin.key,
            ],
          },
        },
      ],
    },
  }),
  TabbablePlugin.configure(({ editor }) => ({
    options: {
      query: () => {
        if (isSelectionAtBlockStart(editor)) return false;

        return !someNode(editor, {
          match: (n) => {
            return !!(
              n.type &&
              ([
                TablePlugin.key,
                TodoListPlugin.key,
                CodeBlockPlugin.key,
              ].includes(n.type as string) ||
                n.listStyleType)
            );
          },
        });
      },
    },
  })),
  TrailingBlockPlugin.configure({
    options: { type: ParagraphPlugin.key },
  }),
  DragOverCursorPlugin,

  // Deserialization
  DocxPlugin,
  MarkdownPlugin,
  JuicePlugin,
];
export const useMyEditor = (initialValue: Value | string) => {
  return usePlateEditor({
    plugins: plugins,
    override: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      components: withDraggables(
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
      ),
    },
    value:
      typeof initialValue === "string"
        ? (JSON.parse(initialValue) as Value)
        : initialValue,
  });
};
