/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

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
} from "@udecode/plate-common";
import { ParagraphPlugin } from "@udecode/plate-common/react";
import { DndPlugin } from "@udecode/plate-dnd";
import { DocxPlugin } from "@udecode/plate-docx";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
import { FontColorPlugin, FontSizePlugin } from "@udecode/plate-font/react";
import { HEADING_LEVELS } from "@udecode/plate-heading";
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

import { DragOverCursorPlugin } from "~/components/plate-ui/cursor-overlay";
import {
  TodoLi,
  TodoMarker,
} from "~/components/plate-ui/indent-todo-marker-component";
import { CloudAttachmentPlugin } from "~/components/plate/cloud-plugin/attachment/CloudAttachmentPlugin";
import { CloudPlugin } from "~/components/plate/cloud-plugin/cloud/CloudPlugin";
import { CloudImagePlugin } from "~/components/plate/cloud-plugin/image/CloudImagePlugin";
import { autoformatRules } from "~/lib/plate/autoformat-rules";
import { LinkFloatingToolbar } from "../plate-ui/link-floating-toolbar";
import { FieldReportFormPlugin } from "./field-report-plugin";

export const plugins = [
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
  FieldReportFormPlugin,
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
