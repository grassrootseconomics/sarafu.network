import { isDefined, type TElement } from "@udecode/plate";
import { useEditorRef } from "@udecode/plate/react";
import { useEffect } from "react";
import { useFocused, useSelected } from "slate-react";
import { useUpload } from "../upload/useUpload";

interface TCloudAttachmentElement extends TElement {
  bytes: number;
  filename: string;
  url: string;
}
export const useCloudAttachmentElementState = ({
  element,
}: {
  element: TCloudAttachmentElement;
}) => {
  const editor = useEditorRef();
  const upload = useUpload(element.url);
  const url = upload.status === "not-found" ? void 0 : upload.url;
  useEffect(() => {
    if (isDefined(url) && !url.startsWith("blob:") && url !== element.url) {
      const path = editor.api.findPath(element);
      if (path) {
        editor.tf.setNodes(
          { url },
          {
            at: path,
          }
        );
      }
    }
  }, [editor, element, url]);
  const selected = useSelected();
  const focused = useFocused();
  return {
    focused,
    selected,
    upload,
  };
};
