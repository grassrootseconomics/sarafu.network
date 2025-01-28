"use client";

import { useEditorRef } from "@udecode/plate-common/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { NewspaperIcon } from "lucide-react";
import { insertFieldReportForm } from "../plate/field-report-plugin";

export function ReportDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const handleForm = () => {
    insertFieldReportForm(editor);
  };

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert Report">
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
