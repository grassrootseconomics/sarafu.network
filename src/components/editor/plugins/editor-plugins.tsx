/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import {
  BlockquotePlugin,
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { TextAlignPlugin } from "@platejs/basic-styles/react";
import { CaptionPlugin } from "@platejs/caption/react";

import { HorizontalRulePlugin } from "@platejs/basic-nodes/react";
import {
  FontColorPlugin,
  FontSizePlugin,
  LineHeightPlugin,
} from "@platejs/basic-styles/react";
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@platejs/code-block/react";
import { DndPlugin } from "@platejs/dnd";
import { HeadingPlugin } from "@platejs/basic-nodes/react";
import { IndentPlugin } from "@platejs/indent/react";
import { ListPlugin } from "@platejs/list/react";
import { ImagePlugin, MediaEmbedPlugin } from "@platejs/media/react";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@platejs/table/react";
import { TrailingBlockPlugin } from "platejs";

import { ParagraphPlugin } from "platejs/react";
import { CloudAttachmentPlugin } from "~/components/editor/plugins/cloud-plugin/attachment/CloudAttachmentPlugin";
import { CloudPlugin } from "~/components/editor/plugins/cloud-plugin/cloud/CloudPlugin";
import { CloudImagePlugin } from "~/components/editor/plugins/cloud-plugin/image/CloudImagePlugin";
// import { LinkFloatingToolbar } from "~/components/plate-ui/link-floating-toolbar";
import { autoformatPlugin } from "~/lib/plate/autoformat-rules";
import { FieldReportFormPlugin } from "./field-report-plugin";
import { BlockPlaceholderKit } from "~/components/ui/block-placeholder";
import { LinkPlugin } from "@platejs/link/react";
import { LinkElement } from "~/components/ui/link-node";
import { LinkFloatingToolbar } from "~/components/ui/link-toolbar";

export const corePlugins = [
  ParagraphPlugin,
  HeadingPlugin,
  BlockquotePlugin,
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
  HorizontalRulePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  LinkPlugin.configure({
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [ImagePlugin.key, CloudImagePlugin.key, MediaEmbedPlugin.key],
      },
    },
  }),
  TablePlugin,
  TableRowPlugin,
  TableCellPlugin,
  TableCellHeaderPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  FontColorPlugin,
  FontSizePlugin,
  TextAlignPlugin,
  IndentPlugin,
  ListPlugin,
  LineHeightPlugin,
  TrailingBlockPlugin,
];

export const viewPlugins = [
  ...corePlugins,
  // Add view-only plugins here if needed
];

export const editorPlugins = [
  ...BlockPlaceholderKit,
  CloudPlugin.configure({ options: {} }),
  CloudImagePlugin.configure({
    options: {
      maxInitialHeight: 1000,
      maxInitialWidth: 1000,
    },
  }),
  CloudAttachmentPlugin.configure({ options: {} }),
  FieldReportFormPlugin,
  ...corePlugins,
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
  DndPlugin.configure({ options: { enableScroller: true } }),
  
];
