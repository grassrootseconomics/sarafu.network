"use client";

import type { PlateEditor } from "platejs/react";

import { insertCallout } from "@platejs/callout";
import { CalloutPlugin } from "@platejs/callout/react";
import { insertDate } from "@platejs/date";
import { DatePlugin } from "@platejs/date/react";
import { ColumnItemPlugin, ColumnPlugin } from "@platejs/layout/react";
import { LinkPlugin, triggerFloatingLink } from "@platejs/link/react";
import { ListStyleType } from "@platejs/list";
import { ListPlugin } from "@platejs/list/react";
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@platejs/table/react";
import {
  type NodeEntry,
  type Path,
  type TElement,
  KEYS,
  PathApi,
} from "platejs";

export const STRUCTURAL_TYPES: string[] = [
  ColumnPlugin.key,
  ColumnItemPlugin.key,
  TablePlugin.key,
  TableRowPlugin.key,
  TableCellPlugin.key,
];

const insertList = (editor: PlateEditor, type: string) => {
  editor.tf.insertNodes(
    editor.api.create.block({
      indent: 1,
      listStyleType: type,
    }),
    { select: true }
  );
};

const insertBlockMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [KEYS.listTodo]: insertList,
  [ListStyleType.Decimal]: insertList,
  [ListStyleType.Disc]: insertList,
  [CalloutPlugin.key]: (editor) => insertCallout(editor, { select: true }),
  [TablePlugin.key]: (editor) =>
    editor.getTransforms(TablePlugin).insert.table({}, { select: true }),
};

const insertInlineMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [DatePlugin.key]: (editor) => insertDate(editor, { select: true }),
  [LinkPlugin.key]: (editor) => triggerFloatingLink(editor, { focused: true }),
};

export const insertBlock = (editor: PlateEditor, type: string) => {
  editor.tf.withoutNormalizing(() => {
    const block = editor.api.block();

    if (!block) return;
    if (type in insertBlockMap) {
      insertBlockMap[type]!(editor, type);
    } else {
      editor.tf.insertNodes(editor.api.create.block({ type }), {
        at: PathApi.next(block[1]),
        select: true,
      });
    }
  });
};

export const insertInlineElement = (editor: PlateEditor, type: string) => {
  if (insertInlineMap[type]) {
    insertInlineMap[type](editor, type);
  }
};

const setList = (
  editor: PlateEditor,
  type: string,
  entry: NodeEntry<TElement>
) => {
  editor.tf.setNodes(
    editor.api.create.block({
      indent: 1,
      listStyleType: type,
    }),
    {
      at: entry[1],
    }
  );
};

const setBlockMap: Record<
  string,
  (editor: PlateEditor, type: string, entry: NodeEntry<TElement>) => void
> = {
  [KEYS.listTodo]: setList,
  [ListStyleType.Decimal]: setList,
  [ListStyleType.Disc]: setList,
};

export const setBlockType = (
  editor: PlateEditor,
  type: string,
  { at }: { at?: Path } = {}
) => {
  editor.tf.withoutNormalizing(() => {
    const setEntry = (entry: NodeEntry<TElement>) => {
      const [node, path] = entry;

      if (node[ListPlugin.key]) {
        editor.tf.unsetNodes([ListPlugin.key, "indent"], { at: path });
      }
      if (type in setBlockMap) {
        return setBlockMap[type]!(editor, type, entry);
      }
      if (node.type !== type) {
        editor.tf.setNodes({ type }, { at: path });
      }
    };

    if (at) {
      const entry = editor.api.node<TElement>(at);

      if (entry) {
        setEntry(entry);

        return;
      }
    }

    const entries = editor.api.blocks({ mode: "lowest" });

    entries.forEach((entry) => setEntry(entry));
  });
};

export const getBlockType = (block: TElement) => {
  if (block[ListPlugin.key]) {
    if (block[ListPlugin.key] === ListStyleType.Decimal) {
      return ListStyleType.Decimal;
    } else if (block[ListPlugin.key] === KEYS.listTodo) {
      return KEYS.listTodo;
    } else {
      return ListStyleType.Disc;
    }
  }

  return block.type;
};
