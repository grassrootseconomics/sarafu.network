import { type Value } from "@udecode/plate-common";
import { type Upload } from "../upload/useUpload";

export const isStoreRef = (url: string) => url.startsWith("#");

/**
 * Takes an array of `nodes` and a lookup for `origins` and normalizes the
 * `nodes` such that:
 *
 * - Any node with an `id` that is a `url` is left alone
 * - Any node with an `id` that is a `key` for lookup in `origins` is converted to
 *   a `url` if the origin file has been successfully uploaded
 * - If the origin file has not been uploaded or is in an error state, then we
 *   remove that element.
 *
 * We do some typecasting here to help the Descendant values pass through. We
 * are confident this is okay because we only augment the `id` and we only
 * depend on the knowledge that `children`, if present, is an Array of nodes.
 */
export const getSaveValue = <V extends Value>(
  nodes: V,
  uploads: Record<string, Upload>
): V => {
  const nextNodes = [];
  for (const node of nodes) {
    if (
      "url" in node /**
       * If the `node` has an `id` then we either
       *
       * - Leave it alone and add it (it's already normalized)
       * - If found in lookup, replace the url and add it
       * - If not found in lookup, skip it
       */ &&
      typeof node.url === "string"
    ) {
      if (isStoreRef(node.url)) {
        const origin = uploads[node.url];
        if (origin && origin.status === "success") {
          nextNodes.push({ ...node, url: origin.url });
        }
      } else {
        nextNodes.push(node);
      }
      continue;
    }
    if ("children" in node && node.children) {
      nextNodes.push({
        ...node,
        // @ts-expect-error - we know this is a recursive call
        children: getSaveValue(node.children, uploads),
      });
      continue;
    }
    nextNodes.push(node);
  }

  return nextNodes as V;
};
