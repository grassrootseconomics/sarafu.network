import { type PlateEditor } from "@udecode/plate/react";
import { uploadFiles } from "./uploadFiles";

export const onDropCloud = (
  editor: PlateEditor,
  e: React.DragEvent<Element>
) => {
  const { files } = e.dataTransfer;
  if (files.length === 0) return false;
  e.preventDefault();
  e.stopPropagation();

  const at = editor.api.findEventRange(e);
  if (!at) return false;
  editor.tf.select(at);
  uploadFiles(editor, files);
  return true;
};
export const onPasteCloud = (
  editor: PlateEditor,
  e: React.ClipboardEvent<Element>
) => {
  const { files } = e.clipboardData;
  if (files.length === 0) return false;
  e.preventDefault();
  e.stopPropagation();
  uploadFiles(editor, files);
  return true;
};
