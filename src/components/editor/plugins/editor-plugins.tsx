/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { AlignPlugin } from "@udecode/plate-alignment/react";
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
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@udecode/plate-code-block/react";
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
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { SelectOnBackspacePlugin } from "@udecode/plate-select";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";

import { ParagraphPlugin } from "@udecode/plate/react";
import { CloudAttachmentPlugin } from "~/components/editor/plugins/cloud-plugin/attachment/CloudAttachmentPlugin";
import { CloudPlugin } from "~/components/editor/plugins/cloud-plugin/cloud/CloudPlugin";
import { CloudImagePlugin } from "~/components/editor/plugins/cloud-plugin/image/CloudImagePlugin";
// import { LinkFloatingToolbar } from "~/components/plate-ui/link-floating-toolbar";
import { autoformatPlugin } from "~/lib/plate/autoformat-rules";
import { FieldReportFormPlugin } from "./field-report-plugin";

export const editorPlugins = [
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
  HeadingPlugin,
  BlockquotePlugin,
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
  HorizontalRulePlugin,
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
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  FontColorPlugin,
  FontSizePlugin,
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
  autoformatPlugin,
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
        { hotkey: "mod+enter" },
        { hotkey: "mod+shift+enter", before: true },
        {
          hotkey: "enter",
          query: { start: true, end: true, allow: HEADING_LEVELS },
          relative: true,
          level: 1,
        },
      ],
    },
  }),
  NodeIdPlugin,
  SelectOnBackspacePlugin.configure({
    options: {
      query: { allow: [ImagePlugin.key, HorizontalRulePlugin.key] },
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
  TrailingBlockPlugin.configure({
    options: { type: ParagraphPlugin.key },
  }),
  MarkdownPlugin,
  DocxPlugin,
  JuicePlugin,
  ParagraphPlugin,
];

// Assuming viewPlugins was originally an alias or identical to editorPlugins
export const viewPlugins = editorPlugins;
