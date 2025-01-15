"use client";

import { focusEditor, useEditorRef } from "@udecode/plate-common/react";
import { insertMediaEmbed } from "@udecode/plate-media";
import { PaperclipIcon } from "lucide-react";
import { Icons } from "~/components/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { uploadFile } from "../plate/cloud-plugin/cloud/uploadFiles";

export function MediaDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const handleEmbed = () => {
    const url = prompt("Enter embed URL:");
    if (!url) return;

    insertMediaEmbed(editor, {
      url,
    });
    focusEditor(editor);
  };

  const handleMediaUpload = (type: "image" | "file") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      uploadFile(editor, file);
      focusEditor(editor);
    };

    input.click();
  };

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert Media">
          <Icons.image />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-[180px] flex-col gap-0.5 overflow-y-auto"
      >
        <DropdownMenuItem onSelect={() => handleMediaUpload("image")}>
          <Icons.image className="mr-2 size-5" />
          Upload Image
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => handleMediaUpload("file")}>
          <PaperclipIcon className="mr-2 size-5" />
          Upload File
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={handleEmbed}>
          <Icons.embed className="mr-2 size-5" />
          Embed Video
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
