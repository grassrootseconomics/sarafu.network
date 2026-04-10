"use client";

import type { AutoformatRule } from "@platejs/autoformat";

import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  AutoformatPlugin,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from "@platejs/autoformat";
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { insertEmptyCodeBlock } from "@platejs/code-block";
import { CodeBlockPlugin } from "@platejs/code-block/react";
import { ListStyleType, toggleList } from "@platejs/list";
import { openNextToggles, TogglePlugin } from "@platejs/toggle/react";
import { KEYS } from "platejs";
import { ParagraphPlugin } from "platejs/react";

const autoformatMarks: AutoformatRule[] = [
  {
    match: "***",
    mode: "mark",
    type: [BoldPlugin.key, ItalicPlugin.key],
  },
  {
    match: "__*",
    mode: "mark",
    type: [UnderlinePlugin.key, ItalicPlugin.key],
  },
  {
    match: "__**",
    mode: "mark",
    type: [UnderlinePlugin.key, BoldPlugin.key],
  },
  {
    match: "___***",
    mode: "mark",
    type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
  },
  {
    match: "**",
    mode: "mark",
    type: BoldPlugin.key,
  },
  {
    match: "__",
    mode: "mark",
    type: UnderlinePlugin.key,
  },
  {
    match: "*",
    mode: "mark",
    type: ItalicPlugin.key,
  },
  {
    match: "_",
    mode: "mark",
    type: ItalicPlugin.key,
  },
  {
    match: "~~",
    mode: "mark",
    type: StrikethroughPlugin.key,
  },
  {
    match: "^",
    mode: "mark",
    type: SuperscriptPlugin.key,
  },
  {
    match: "~",
    mode: "mark",
    type: SubscriptPlugin.key,
  },
  {
    match: "==",
    mode: "mark",
    type: HighlightPlugin.key,
  },
  {
    match: "≡",
    mode: "mark",
    type: HighlightPlugin.key,
  },
  {
    match: "`",
    mode: "mark",
    type: CodePlugin.key,
  },
];

const autoformatBlocks: AutoformatRule[] = [
  {
    match: "# ",
    mode: "block",
    type: KEYS.h1,
  },
  {
    match: "## ",
    mode: "block",
    type: KEYS.h2,
  },
  {
    match: "### ",
    mode: "block",
    type: KEYS.h3,
  },
  {
    match: "#### ",
    mode: "block",
    type: KEYS.h4,
  },
  {
    match: "##### ",
    mode: "block",
    type: KEYS.h5,
  },
  {
    match: "###### ",
    mode: "block",
    type: KEYS.h6,
  },
  {
    match: "> ",
    mode: "block",
    type: BlockquotePlugin.key,
  },
  {
    match: "```",
    mode: "block",
    type: CodeBlockPlugin.key,
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ParagraphPlugin.key,
        insertNodesOptions: { select: true },
      });
    },
  },
  {
    match: "+ ",
    mode: "block",
    preFormat: openNextToggles,
    type: TogglePlugin.key,
  },
  {
    match: ["---", "—-", "___ "],
    mode: "block",
    type: HorizontalRulePlugin.key,
    format: (editor) => {
      editor.tf.setNodes({ type: HorizontalRulePlugin.key });
      editor.tf.insertNodes({
        children: [{ text: "" }],
        type: ParagraphPlugin.key,
      });
    },
  },
];

const autoformatIndentLists: AutoformatRule[] = [
  {
    match: ["* ", "- "],
    mode: "block",
    type: "list",
    format: (editor) => {
      toggleList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    match: [String.raw`^\d+\.$ `, String.raw`^\d+\)$ `],
    matchByRegex: true,
    mode: "block",
    type: "list",
    format: (editor, { matchString }) => {
      toggleList(editor, {
        listRestartPolite: Number(matchString) || 1,
        listStyleType: ListStyleType.Decimal,
      });
    },
  },
  {
    match: ["[] "],
    mode: "block",
    type: "list",
    format: (editor) => {
      toggleList(editor, {
        listStyleType: KEYS.listTodo,
      });
      editor.tf.setNodes({
        checked: false,
        listStyleType: KEYS.listTodo,
      });
    },
  },
  {
    match: ["[x] "],
    mode: "block",
    type: "list",
    format: (editor) => {
      toggleList(editor, {
        listStyleType: KEYS.listTodo,
      });
      editor.tf.setNodes({
        checked: true,
        listStyleType: KEYS.listTodo,
      });
    },
  },
];

export const autoformatPlugin = AutoformatPlugin.configure({
  options: {
    enableUndoOnDelete: true,
    rules: [
      ...autoformatBlocks,
      ...autoformatMarks,
      ...autoformatSmartQuotes,
      ...autoformatPunctuation,
      ...autoformatLegal,
      ...autoformatLegalHtml,
      ...autoformatArrow,
      ...autoformatMath,
      ...autoformatIndentLists,
    ].map(
      (rule): AutoformatRule => ({
        ...rule,
        query: (editor) =>
          !editor.api.some({
            match: { type: editor.getType(CodeBlockPlugin.key) },
          }),
      })
    ),
  },
});
