"use client";

import { insertMediaEmbed } from "@platejs/media";
import { PaperclipIcon } from "lucide-react";
import { useEditorRef } from "platejs/react";
import { Icons } from "~/components/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ToolbarButton } from "~/components/ui/toolbar";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import React from "react";
import { uploadFile } from "~/components/editor/plugins/cloud-plugin/cloud/uploadFiles";

export function MediaDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const handleEmbed = () => {
    const url = prompt("Enter embed URL:");
    if (!url) return;

    insertMediaEmbed(editor, {
      url,
    });
    editor.tf.focus();
  };
  const handleMediaUpload = (type: "image" | "file") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      uploadFile(editor, file);
      editor.tf.focus();
    };

    input.click();
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insert Media">
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
