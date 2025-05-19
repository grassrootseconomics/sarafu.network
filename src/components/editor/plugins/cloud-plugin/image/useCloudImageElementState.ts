import { useEditorRef } from "@udecode/plate/react";
import React from "react";
import { useFocused, useSelected } from "slate-react";
import { type TCloudImageElement } from "~/components/plate-ui/cloud-image-element";
import { generateSrcAndSrcSet } from "../cloud/generateSrcAndSrcSet";
import { useUpload } from "../upload/useUpload";
export const useCloudImageElementState = ({
  element,
}: {
  element: TCloudImageElement;
}) => {
  const editor = useEditorRef();
  const upload = useUpload(element.url);
  const url = upload.status === "not-found" ? void 0 : upload.url;
  React.useEffect(() => {
    if (
      typeof url === "string" &&
      !url.startsWith("blob:") &&
      url !== element.url
    ) {
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
  const [size, setSize] = React.useState({
    height: element.height,
    width: element.width,
  });
  React.useEffect(() => {
    setSize({ height: element.height, width: element.width });
  }, [element.width, element.height]);
  const selected = useSelected();
  const focused = useFocused();
  const { src, srcSet } = generateSrcAndSrcSet({
    maxSize: [element.maxWidth, element.maxHeight],
    size: [element.width, element.height],
    // @ts-expect-error - upload.url is not typed
    url: upload.status === "not-found" ? void 0 : upload.url,
  });
  return {
    focused,
    selected,
    setSize,
    size,
    src,
    srcSet,
    upload,
  };
};
