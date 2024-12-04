import type { PlateEditor } from "@udecode/plate-common/react";
import delay from "delay";
import type { UploadError, UploadSuccess } from "../upload/useUpload";
import { CloudPlugin } from "./CloudPlugin";
import { getInProgressUploads } from "./getInProgressUploads";

const TEN_MINUTES = 1e3 * 60 * 60;

export type FinishUploadsOptions = {
  maxTimeoutInMs?: number;
};
export const finishUploads = async (
  editor: PlateEditor,
  { maxTimeoutInMs = TEN_MINUTES }: FinishUploadsOptions = {}
) => {
  const { uploadStore } = editor.getOptions(CloudPlugin);
  const uploads = uploadStore.get.uploads();
  const uploadingOrigins = getInProgressUploads(editor.children, uploads);
  const finishPromises = uploadingOrigins.reduce(
    (acc, origin) => {
      if ("finishPromise" in origin) {
        acc.push(origin.finishPromise);
      }
      return acc;
    },
    [] as Promise<UploadError | UploadSuccess>[]
  );
  const timeoutPromise = delay(maxTimeoutInMs, { value: "timeout" });
  await Promise.race([Promise.all(finishPromises), timeoutPromise]);
};
