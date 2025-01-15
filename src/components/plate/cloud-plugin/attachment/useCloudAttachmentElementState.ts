import { isDefined, setNodes, type TElement } from "@udecode/plate-common";
import { findNodePath, useEditorRef } from "@udecode/plate-common/react";
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
      const path = findNodePath(editor, element);
      setNodes(
        editor,
        { url },
        {
          at: path,
        }
      );
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
