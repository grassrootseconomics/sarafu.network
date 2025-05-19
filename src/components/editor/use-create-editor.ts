"use client";

import type { NodeComponent, Value } from "@udecode/plate";

import { withProps } from "@udecode/cn";
import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { LinkPlugin } from "@udecode/plate-link/react";

import {
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from "@udecode/plate-media/react";

import { SlashInputPlugin } from "@udecode/plate-slash-command/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
} from "@udecode/plate/react";

import { BlockquoteElement } from "~/components/ui/blockquote-element";
import { ColumnElement } from "~/components/ui/column-element";
import { ColumnGroupElement } from "~/components/ui/column-group-element";
import { DateElement } from "~/components/ui/date-element";
import { HeadingElement } from "~/components/ui/heading-element";
import { HighlightLeaf } from "~/components/ui/highlight-leaf";
import { HrElement } from "~/components/ui/hr-element";
import { ImageElement } from "~/components/ui/image-element";
import { LinkElement } from "~/components/ui/link-element";
import { MediaEmbedElement } from "~/components/ui/media-embed-element";
import { MediaFileElement } from "~/components/ui/media-file-element";
import { MediaVideoElement } from "~/components/ui/media-video-element";
import { ParagraphElement } from "~/components/ui/paragraph-element";
import { withPlaceholders } from "~/components/ui/placeholder";
import { SlashInputElement } from "~/components/ui/slash-input-element";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "~/components/ui/table-cell-element";
import { TableElement } from "~/components/ui/table-element";
import { TableRowElement } from "~/components/ui/table-row-element";
import { TocElement } from "~/components/ui/toc-element";
import { ToggleElement } from "~/components/ui/toggle-element";

import { CloudAttachmentElement } from "../plate-ui/cloud-attachment-element";
import { CloudImageElement } from "../plate-ui/cloud-image-element";
import { CloudAttachmentPlugin } from "./plugins/cloud-plugin/attachment/CloudAttachmentPlugin";
import { CloudImagePlugin } from "./plugins/cloud-plugin/image/CloudImagePlugin";
import { editorPlugins, viewPlugins } from "./plugins/editor-plugins";
import {
  FieldReportElement,
  FieldReportFormPlugin,
} from "./plugins/field-report-plugin";

export const viewComponents = {
  [BlockquotePlugin.key]: BlockquoteElement,
  [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
  [ColumnItemPlugin.key]: ColumnElement,
  [ColumnPlugin.key]: ColumnGroupElement,
  [DatePlugin.key]: DateElement,
  [FilePlugin.key]: MediaFileElement,
  [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
  [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
  [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
  [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: "h4" }),
  [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: "h5" }),
  [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: "h6" }),
  [HighlightPlugin.key]: HighlightLeaf,
  [HorizontalRulePlugin.key]: HrElement,
  [ImagePlugin.key]: ImageElement,
  [CloudImagePlugin.key]: CloudImageElement,
  [CloudAttachmentPlugin.key]: CloudAttachmentElement,
  [FieldReportFormPlugin.key]: FieldReportElement,
  [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
  [LinkPlugin.key]: LinkElement,
  [MediaEmbedPlugin.key]: MediaEmbedElement,
  [ParagraphPlugin.key]: ParagraphElement,
  [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
  [SubscriptPlugin.key]: withProps(PlateLeaf, { as: "sub" }),
  [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: "sup" }),
  [TableCellHeaderPlugin.key]: TableCellHeaderElement,
  [TableCellPlugin.key]: TableCellElement,
  [TablePlugin.key]: TableElement,
  [TableRowPlugin.key]: TableRowElement,
  [TocPlugin.key]: TocElement,
  [TogglePlugin.key]: ToggleElement,
  [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" }),
  [VideoPlugin.key]: MediaVideoElement,
};

export const editorComponents = {
  ...viewComponents,
  [SlashInputPlugin.key]: SlashInputElement,
};

export const useCreateEditor = (
  {
    components: _components,
    placeholders = true,
    readOnly,
    plugins: _customPlugins,
    ...options
  }: {
    placeholders?: boolean;
    plugins?: unknown[];
    readOnly?: boolean;
  } & Omit<CreatePlateEditorOptions, "plugins"> = {},
  deps: unknown[] = []
) => {
  const components = {
    ...(readOnly
      ? viewComponents
      : placeholders
      ? // @ts-expect-error - TODO: fix this
        withPlaceholders(editorComponents)
      : editorComponents),
    ..._components,
  } as Record<string, NodeComponent>;
  const plugins = (readOnly ? viewPlugins : editorPlugins) as PlateCorePlugin[];
  return usePlateEditor<Value>(
    {
      components: components,
      plugins: plugins,
      ...options,
    },
    deps
  );
};
