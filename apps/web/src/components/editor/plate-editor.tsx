"use client";

import { Plate } from "platejs/react";

import { useCreateEditor } from "~/components/editor/use-create-editor";
import { FixedToolbar } from "~/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "~/components/plate-ui/fixed-toolbar-buttons";
import { Editor, EditorContainer } from "~/components/ui/editor";

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
        <Editor variant="ghost"></Editor>
      </EditorContainer>
    </Plate>
  );
}
