"use client";

import { cn } from "@udecode/cn";

import { type PlateElementProps, PlateElement } from "platejs/react";

import { DownloadIcon, PaperclipIcon } from "lucide-react";
import { type TElement } from "platejs";
import { useCloudAttachmentElementState } from "../editor/plugins/cloud-plugin/attachment/useCloudAttachmentElementState";
import { StatusBar } from "./cloud-status-bar";

export interface TCloudAttachmentElement extends TElement {
  bytes: number;
  filename: string;
  url: string;
}
export interface CloudAttachmentElementProps
  extends PlateElementProps<TCloudAttachmentElement> {
  children: React.ReactNode;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function CloudAttachmentElement({
  className,
  ...props
}: CloudAttachmentElementProps) {
  const { children, element } = props;

  const { focused, selected, upload } = useCloudAttachmentElementState({
    element,
  });

  return (
    <PlateElement
      className={cn(
        "relative my-4 flex h-12 max-w-sm items-center gap-2 rounded-lg border border-border bg-background p-4",
        focused && selected && "border-blue-400 shadow-[0_0_1px_3px_#60a5fa]",
        className
      )}
      {...props}
    >
      <div className="shrink-0 text-muted-foreground" contentEditable={false}>
        <PaperclipIcon height={24} width={24} />
      </div>
      <div className="grow" contentEditable={false}>
        <div className="text-sm line-clamp-1">{element.filename}</div>
        <StatusBar upload={upload}>
          <div className="text-sm text-muted-foreground">
            {formatBytes(element.bytes)}
          </div>
        </StatusBar>
      </div>
      <div
        className="ml-4 size-8 shrink-0 duration-200"
        contentEditable={false}
      >
        {upload.status === "success" && (
          <a href={element.url} rel="noreferrer" target="_blank">
            <DownloadIcon
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              height={24}
              width={24}
            />
          </a>
        )}
      </div>
      {children}
    </PlateElement>
  );
}
