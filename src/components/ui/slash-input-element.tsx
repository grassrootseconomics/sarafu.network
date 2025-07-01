"use client";

import * as React from "react";

import type { TComboboxInputElement } from "platejs";

import { BlockquotePlugin } from "@platejs/basic-nodes/react";
import { CalloutPlugin } from "@platejs/callout/react";
import { CodeBlockPlugin } from "@platejs/code-block/react";
import { DatePlugin } from "@platejs/date/react";
import { KEYS } from "platejs";
import { ListStyleType } from "@platejs/list";
import { EquationPlugin, InlineEquationPlugin } from "@platejs/math/react";
import { TablePlugin } from "@platejs/table/react";
import { TogglePlugin } from "@platejs/toggle/react";
import {
  CalendarIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LightbulbIcon,
  ListIcon,
  ListOrdered,
  PilcrowIcon,
  Quote,
  RadicalIcon,
  Square,
  Table,
} from "lucide-react";
import {
  type PlateEditor,
  type PlateElementProps,
  ParagraphPlugin,
  PlateElement,
} from "platejs/react";

import {
  insertBlock,
  insertInlineElement,
} from "~/components/editor/transforms";

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";

type Group = {
  group: string;
  items: Item[];
};

interface Item {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  className?: string;
  focusEditor?: boolean;
  keywords?: string[];
  label?: string;
}

const groups: Group[] = [
  {
    group: "Basic blocks",
    items: [
      {
        icon: <PilcrowIcon />,
        keywords: ["paragraph"],
        label: "Text",
        value: ParagraphPlugin.key,
      },
      {
        icon: <Heading1Icon />,
        keywords: ["title", "h1"],
        label: "Heading 1",
        value: KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        keywords: ["subtitle", "h2"],
        label: "Heading 2",
        value: KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        keywords: ["subtitle", "h3"],
        label: "Heading 3",
        value: KEYS.h3,
      },
      {
        icon: <ListIcon />,
        keywords: ["unordered", "ul", "-"],
        label: "Bulleted list",
        value: ListStyleType.Disc,
      },
      {
        icon: <ListOrdered />,
        keywords: ["ordered", "ol", "1"],
        label: "Numbered list",
        value: ListStyleType.Decimal,
      },
      {
        icon: <Square />,
        keywords: ["checklist", "task", "checkbox", "[]"],
        label: "To-do list",
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        keywords: ["collapsible", "expandable"],
        label: "Toggle",
        value: TogglePlugin.key,
      },
      {
        icon: <Code2 />,
        keywords: ["```"],
        label: "Code Block",
        value: CodeBlockPlugin.key,
      },
      {
        icon: <Table />,
        label: "Table",
        value: TablePlugin.key,
      },
      {
        icon: <Quote />,
        keywords: ["citation", "blockquote", "quote", ">"],
        label: "Blockquote",
        value: BlockquotePlugin.key,
      },
      {
        description: "Insert a highlighted block.",
        icon: <LightbulbIcon />,
        keywords: ["note"],
        label: "Callout",
        value: CalloutPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Advanced blocks",
    items: [
      {
        icon: <Columns3Icon />,
        label: "3 columns",
        value: "action_three_columns",
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: "Equation",
        value: EquationPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Inline",
    items: [
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        keywords: ["time"],
        label: "Date",
        value: DatePlugin.key,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: "Inline Equation",
        value: InlineEquationPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;

  return (
    <PlateElement {...props} as="span" data-slate-value={element.value}>
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {groups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(
                ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                  <InlineComboboxItem
                    key={value}
                    value={value}
                    onClick={() => onSelect(editor, value)}
                    label={label}
                    focusEditor={focusEditor}
                    group={group}
                    keywords={keywords}
                  >
                    <div className="mr-2 text-muted-foreground">{icon}</div>
                    {label ?? value}
                  </InlineComboboxItem>
                )
              )}
            </InlineComboboxGroup>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
