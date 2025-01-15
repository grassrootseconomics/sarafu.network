import { select } from "@udecode/plate-common";
import { findEventRange, type PlateEditor } from "@udecode/plate-common/react";
import { uploadFiles } from "./uploadFiles";

export const onDropCloud = (
  editor: PlateEditor,
  e: React.DragEvent<Element>
) => {
  const { files } = e.dataTransfer;
  if (files.length === 0) return false;
  e.preventDefault();
  e.stopPropagation();
  const at = findEventRange(editor, e);
  if (!at) return false;
  select(editor, at);
  uploadFiles(editor, files);
  return true;
};
export const onPasteCloud = (
  editor: PlateEditor,
  e: React.ClipboardEvent<Element>
) => {
  const { files } = e.clipboardData;
  console.log("files", files);
  if (files.length === 0) return false;
  e.preventDefault();
  e.stopPropagation();
  uploadFiles(editor, files);
  return true;
};
