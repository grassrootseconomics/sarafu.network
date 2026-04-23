import type { Descendant } from "slate";
import type { Upload } from "../upload/useUpload";
import { isStoreRef } from "./getSavedValue";

const _getInProgressUploads = (
  nodes: Descendant[],
  uploads: Record<string, Upload>,
  progressUploads: Upload[] = []
) => {
  for (const node of nodes) {
    if (
      "url" in node /**
       * If the `node` has a `url` then we either
       *
       * - Leave it alone and add it (it's already an actual URL)
       * - If found in the store lookup, replace the store ref with a URL
       * - If not found in lookup, skip it
       */ &&
      typeof node.url === "string"
    ) {
      if (isStoreRef(node.url)) {
        const origin = uploads[node.url];
        if (origin && origin.status === "progress") {
          progressUploads.push(origin);
        }
      }
      continue;
    }
    if ("children" in node && node.children) {
      _getInProgressUploads(node.children, uploads, progressUploads);
      continue;
    }
  }
  return progressUploads;
};
export const getInProgressUploads = (
  nodes: Descendant[],
  origins: Record<string, Upload>
) => {
  const progressUploads: Upload[] = [];
  return _getInProgressUploads(nodes, origins, progressUploads);
};
