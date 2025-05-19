"use client";

import { useEditorRef } from "@udecode/plate/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ToolbarButton } from "~/components/ui/toolbar";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { NewspaperIcon } from "lucide-react";
import React from "react";
import { insertFieldReportForm } from "~/components/editor/plugins/field-report-plugin";

export function ReportDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const handleForm = () => {
    insertFieldReportForm(editor);
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insert Report">
          <NewspaperIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-[180px] flex-col gap-0.5 overflow-y-auto"
      >
        <DropdownMenuItem onSelect={handleForm}>Field Report</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
