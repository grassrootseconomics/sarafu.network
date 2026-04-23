"use client";

import { KEYS, type NodeComponent, type Value } from "platejs";

import {
  BlockquotePlugin,
  BoldPlugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { DatePlugin } from "@platejs/date/react";
import { ColumnItemPlugin, ColumnPlugin } from "@platejs/layout/react";
import { LinkPlugin } from "@platejs/link/react";
import { withProps } from "@udecode/cn";

import {
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from "@platejs/media/react";

import { SlashInputPlugin } from "@platejs/slash-command/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@platejs/table/react";
import { TogglePlugin } from "@platejs/toggle/react";
import {
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
} from "platejs/react";

import { BlockquoteElement } from "~/components/ui/blockquote-element";
import { ColumnElement } from "~/components/ui/column-element";
import { ColumnGroupElement } from "~/components/ui/column-group-element";
import { DateElement } from "~/components/ui/date-element";
import { HeadingElement } from "~/components/ui/heading-element";
import { HighlightLeaf } from "~/components/ui/highlight-leaf";
import { HrElement } from "~/components/ui/hr-element";
import { ImageElement } from "~/components/ui/image-element";
import { LinkElement } from "~/components/ui/link-node";
import { MediaEmbedElement } from "~/components/ui/media-embed-element";
import { MediaFileElement } from "~/components/ui/media-file-element";
import { MediaVideoElement } from "~/components/ui/media-video-element";
import { ParagraphElement } from "~/components/ui/paragraph-element";
import { SlashInputElement } from "~/components/ui/slash-input-element";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "~/components/ui/table-cell-element";
import { TableElement } from "~/components/ui/table-element";
import { TableRowElement } from "~/components/ui/table-row-element";
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
  [KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
  [KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
  [KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
  [KEYS.h4]: withProps(HeadingElement, { variant: "h4" }),
  [KEYS.h5]: withProps(HeadingElement, { variant: "h5" }),
  [KEYS.h6]: withProps(HeadingElement, { variant: "h6" }),
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
    readOnly,
    plugins: _customPlugins,
    ...options
  }: {
    plugins?: unknown[];
    readOnly?: boolean;
  } & Omit<CreatePlateEditorOptions, "plugins"> = {},
  deps: unknown[] = []
) => {
  const components = {
    ...(readOnly ? viewComponents : editorComponents),
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
